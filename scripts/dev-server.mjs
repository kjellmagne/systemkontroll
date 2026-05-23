import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import { Pool } from "pg";
import { createDefaultPersistedState, normalizePersistedState } from "./persisted-state.mjs";
import {
  screenRegistry,
  settingsCatalogs,
  sidebarNavigation,
  topBarLinks
} from "../public/screen-specs.js";

const currentFile = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFile), "..");
const publicDir = path.join(rootDir, "public");
const frontendDistDir = path.join(rootDir, "frontend", "dist");
const generatedModelPath = path.join(publicDir, "generated", "systemkontroll-model.json");
const organizationStructurePath = process.env.ORG_STRUCTURE_PATH
  ? path.resolve(process.env.ORG_STRUCTURE_PATH)
  : path.join(publicDir, "organization-structure.json");
const port = Number(process.env.PORT ?? 3000);

if (!existsSync(generatedModelPath)) {
  const result = spawnSync(process.execPath, [path.join(rootDir, "scripts", "build-data.mjs")], {
    cwd: rootDir,
    stdio: "inherit"
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const pool = new Pool(resolveDatabaseConfig());
await waitForDatabase(pool);
await ensureDatabaseSchema(pool);
await seedPersistedState(pool);

const app = express();
app.disable("x-powered-by");
app.use(express.json({ limit: "30mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false, error: "database_unavailable", detail: error.message });
  }
});

app.get("/api/state", async (_req, res) => {
  try {
    const state = await readPersistedState(pool);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "state_read_failed", detail: error.message });
  }
});

app.get("/api/bootstrap", (_req, res) => {
  res.json({
    screenRegistry,
    settingsCatalogs,
    sidebarNavigation,
    topBarLinks
  });
});

app.post("/api/files", async (req, res) => {
  try {
    const uploadedFile = await createStoredFile(pool, req.body);
    res.status(201).json(uploadedFile);
  } catch (error) {
    const statusCode = error?.code === "invalid_file_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "file_upload_failed", detail: error.message });
  }
});

app.get("/api/files/:fileId", async (req, res) => {
  try {
    const storedFile = await readStoredFile(pool, req.params.fileId);
    if (!storedFile) {
      res.status(404).json({ error: "file_not_found" });
      return;
    }

    res.setHeader("Content-Type", storedFile.mimeType || "application/octet-stream");
    res.setHeader("Content-Length", String(storedFile.sizeBytes ?? storedFile.content.length));
    res.setHeader("Content-Disposition", buildContentDispositionHeader(storedFile.name));
    res.send(storedFile.content);
  } catch (error) {
    res.status(500).json({ error: "file_read_failed", detail: error.message });
  }
});

app.put("/api/state", async (req, res) => {
  try {
    const nextState = normalizePersistedState(req.body);
    const savedState = await writePersistedState(pool, nextState);
    res.json(savedState);
  } catch (error) {
    res.status(500).json({ error: "state_write_failed", detail: error.message });
  }
});

if (existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir, { extensions: ["html"] }));
}
app.use(express.static(publicDir, { extensions: ["html"] }));

app.get(/^(?!\/api\/).*/, (req, res) => {
  const indexPath = existsSync(path.join(frontendDistDir, "index.html"))
    ? path.join(frontendDistDir, "index.html")
    : path.join(publicDir, "index.html");
  res.sendFile(indexPath);
});

app.listen(port, () => {
  console.log(`SystemKontroll available at http://localhost:${port}`);
});

async function waitForDatabase(clientPool, attempts = 30, delayMs = 2000) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await clientPool.query("SELECT 1");
      return;
    } catch (error) {
      if (attempt === attempts) {
        throw error;
      }

      console.warn(`Database not ready yet (attempt ${attempt}/${attempts}). Retrying in ${delayMs}ms...`);
      await delay(delayMs);
    }
  }
}

async function ensureDatabaseSchema(clientPool) {
  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS app_state (
      id SMALLINT PRIMARY KEY CHECK (id = 1),
      data JSONB NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      mime_type TEXT,
      size_bytes INTEGER NOT NULL,
      content BYTEA NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

async function seedPersistedState(clientPool) {
  const existing = await clientPool.query("SELECT id FROM app_state WHERE id = 1");
  if (existing.rowCount > 0) {
    return;
  }

  const initialState = createDefaultPersistedState();
  await clientPool.query(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES (1, $1::jsonb, NOW())
    `,
    [JSON.stringify(initialState)]
  );
}

async function readPersistedState(clientPool) {
  const result = await clientPool.query("SELECT data FROM app_state WHERE id = 1");
  if (result.rowCount === 0) {
    const defaultState = createDefaultPersistedState();
    await writePersistedState(clientPool, defaultState);
    return defaultState;
  }

  const normalizedState = normalizePersistedState(result.rows[0].data);
  normalizedState.organizationStructure = await readOrganizationStructureFile();
  return normalizePersistedState(normalizedState);
}

async function writePersistedState(clientPool, nextState) {
  const normalizedState = normalizePersistedState(nextState);
  normalizedState.organizationStructure = await writeOrganizationStructureFile(normalizedState.organizationStructure);
  await clientPool.query(
    `
      INSERT INTO app_state (id, data, updated_at)
      VALUES (1, $1::jsonb, NOW())
      ON CONFLICT (id)
      DO UPDATE SET data = EXCLUDED.data, updated_at = NOW()
    `,
    [JSON.stringify(normalizedState)]
  );

  return normalizedState;
}

async function readOrganizationStructureFile() {
  if (!existsSync(organizationStructurePath)) {
    const defaultState = createDefaultPersistedState();
    return writeOrganizationStructureFile(defaultState.organizationStructure ?? []);
  }

  try {
    const fileContents = await readFile(organizationStructurePath, "utf8");
    return JSON.parse(fileContents);
  } catch (error) {
    console.warn(`Could not read ${organizationStructurePath}. Falling back to defaults.`, error);
    const defaultState = createDefaultPersistedState();
    return writeOrganizationStructureFile(defaultState.organizationStructure ?? []);
  }
}

async function writeOrganizationStructureFile(organizationStructure) {
  await writeFile(organizationStructurePath, `${JSON.stringify(organizationStructure, null, 2)}\n`, "utf8");
  return organizationStructure;
}

function resolveDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
    };
  }

  return {
    host: process.env.DB_HOST ?? "127.0.0.1",
    port: Number(process.env.DB_PORT ?? 5432),
    database: process.env.DB_NAME ?? "systemkontroll",
    user: process.env.DB_USER ?? "systemkontroll",
    password: process.env.DB_PASSWORD ?? "systemkontroll",
    ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : false
  };
}

function delay(timeoutMs) {
  return new Promise((resolve) => {
    setTimeout(resolve, timeoutMs);
  });
}

async function createStoredFile(clientPool, payload) {
  const normalizedName = String(payload?.name ?? "").trim();
  const normalizedBase64 = String(payload?.contentBase64 ?? "").trim();
  const normalizedMimeType = String(payload?.mimeType ?? "").trim();
  const requestedSize = Number(payload?.sizeBytes ?? 0);

  if (!normalizedName || !normalizedBase64) {
    const error = new Error("Filnavn og filinnhold må være oppgitt.");
    error.code = "invalid_file_payload";
    throw error;
  }

  let fileBuffer;
  try {
    fileBuffer = Buffer.from(normalizedBase64, "base64");
  } catch {
    const error = new Error("Filinnholdet kunne ikke dekodes.");
    error.code = "invalid_file_payload";
    throw error;
  }

  if (!fileBuffer.length) {
    const error = new Error("Tom fil kan ikke lastes opp.");
    error.code = "invalid_file_payload";
    throw error;
  }

  if (requestedSize && requestedSize !== fileBuffer.length) {
    const error = new Error("Oppgitt filstørrelse stemmer ikke med innholdet.");
    error.code = "invalid_file_payload";
    throw error;
  }

  const fileId = `file-${randomUUID()}`;
  const result = await clientPool.query(
    `
      INSERT INTO uploaded_files (id, name, mime_type, size_bytes, content, created_at)
      VALUES ($1, $2, $3, $4, $5, NOW())
      RETURNING id, name, mime_type, size_bytes, created_at
    `,
    [fileId, normalizedName, normalizedMimeType || null, fileBuffer.length, fileBuffer]
  );

  return mapStoredFileMetadata(result.rows[0]);
}

async function readStoredFile(clientPool, fileId) {
  const normalizedFileId = String(fileId ?? "").trim();
  if (!normalizedFileId) {
    return null;
  }

  const result = await clientPool.query(
    `
      SELECT id, name, mime_type, size_bytes, content, created_at
      FROM uploaded_files
      WHERE id = $1
    `,
    [normalizedFileId]
  );

  if (result.rowCount === 0) {
    return null;
  }

  const row = result.rows[0];
  return {
    ...mapStoredFileMetadata(row),
    content: row.content
  };
}

function mapStoredFileMetadata(row = {}) {
  return {
    id: String(row.id ?? "").trim(),
    name: String(row.name ?? "").trim(),
    mimeType: String(row.mime_type ?? "").trim(),
    sizeBytes: Number(row.size_bytes ?? 0),
    createdAt: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at ?? "").trim(),
    downloadUrl: `/api/files/${encodeURIComponent(String(row.id ?? "").trim())}`
  };
}

function buildContentDispositionHeader(fileName) {
  const sanitizedFileName = String(fileName ?? "fil").replace(/["\r\n]/g, "_");
  const encodedFileName = encodeURIComponent(sanitizedFileName);
  return `attachment; filename="${sanitizedFileName}"; filename*=UTF-8''${encodedFileName}`;
}
