import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createHash, createHmac, randomBytes, randomUUID, scryptSync, timingSafeEqual } from "node:crypto";
import { fileURLToPath } from "node:url";
import express from "express";
import { createRemoteJWKSet, jwtVerify } from "jose";
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
const authConfig = resolveAuthConfig();
const authAttemptStore = new Map();
const authSessionStore = new Map();
const discoveryCache = new Map();
const jwksCache = new Map();

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
await seedUserAccounts(pool);

const app = express();
app.disable("x-powered-by");
if (process.env.TRUST_PROXY === "true") {
  app.set("trust proxy", 1);
}
app.use(express.json({ limit: "30mb" }));

app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true });
  } catch (error) {
    res.status(503).json({ ok: false, error: "database_unavailable", detail: error.message });
  }
});

app.get("/api/auth/session", async (req, res) => {
  try {
    const session = await refreshAuthSession(readAuthSession(req));
    if (!session) {
      clearAuthSessionCookie(res);
    }
    res.json({
      authRequired: authConfig.required,
      authenticated: Boolean(session),
      user: session?.user ?? null,
      providers: authConfig.providers.map(({ key, label, type }) => ({ key, label, type }))
    });
  } catch (error) {
    res.status(500).json({ error: "auth_session_failed", detail: error.message });
  }
});

app.post("/api/auth/local", async (req, res) => {
  try {
    if (!authConfig.required) {
      res.json({ ok: true });
      return;
    }

    if (!authConfig.localProvider.enabled) {
      res.status(404).json({ error: "local_auth_not_configured" });
      return;
    }

    const identifier = String(req.body?.identifier ?? "").trim().toLowerCase();
    const password = String(req.body?.password ?? "");
    const account = await findLocalUserAccount(pool, identifier);

    if (!account || !verifyUserPassword(password, account.password_hash)) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }

    await markUserLogin(pool, account.id, "local");
    const user = userAccountToSessionUser(account, "local");
    createAuthSession(res, user);
    res.json({ ok: true, user });
  } catch (error) {
    console.error("Local login failed", error);
    res.status(500).json({ error: "local_login_failed" });
  }
});

app.get("/api/auth/login/:provider", async (req, res) => {
  try {
    if (!authConfig.required) {
      res.redirect(normalizeLocalReturnTo(req.query.returnTo));
      return;
    }

    const provider = authConfig.providers.find((candidate) => candidate.key === req.params.provider);
    if (!provider) {
      res.status(404).json({ error: "auth_provider_not_configured" });
      return;
    }

    purgeExpiredAuthRecords();
    const discovery = await resolveProviderDiscovery(provider);
    const state = createToken();
    const nonce = createToken();
    const codeVerifier = createToken(48);
    const codeChallenge = base64Url(createHash("sha256").update(codeVerifier).digest());
    const returnTo = normalizeLocalReturnTo(req.query.returnTo);

    authAttemptStore.set(state, {
      providerKey: provider.key,
      nonce,
      codeVerifier,
      returnTo,
      createdAt: Date.now()
    });

    const authorizeUrl = new URL(discovery.authorization_endpoint);
    authorizeUrl.searchParams.set("client_id", provider.clientId);
    authorizeUrl.searchParams.set("redirect_uri", provider.redirectUri);
    authorizeUrl.searchParams.set("response_type", "code");
    authorizeUrl.searchParams.set("scope", provider.scope);
    authorizeUrl.searchParams.set("state", state);
    authorizeUrl.searchParams.set("nonce", nonce);
    authorizeUrl.searchParams.set("code_challenge", codeChallenge);
    authorizeUrl.searchParams.set("code_challenge_method", "S256");
    if (provider.prompt) {
      authorizeUrl.searchParams.set("prompt", provider.prompt);
    }

    res.redirect(authorizeUrl.toString());
  } catch (error) {
    console.error("Login start failed", error);
    res.redirect("/?auth_error=login_start_failed");
  }
});

app.get("/api/auth/callback/:provider", async (req, res) => {
  try {
    const provider = authConfig.providers.find((candidate) => candidate.key === req.params.provider);
    const state = String(req.query.state ?? "");
    const code = String(req.query.code ?? "");
    const attempt = authAttemptStore.get(state);
    authAttemptStore.delete(state);

    if (!provider || !attempt || attempt.providerKey !== provider.key || !code) {
      res.redirect("/?auth_error=invalid_login_response");
      return;
    }

    if (Date.now() - attempt.createdAt > 10 * 60 * 1000) {
      res.redirect("/?auth_error=login_expired");
      return;
    }

    const discovery = await resolveProviderDiscovery(provider);
    const tokenResponse = await fetch(discovery.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: provider.redirectUri,
        client_id: provider.clientId,
        client_secret: provider.clientSecret,
        code_verifier: attempt.codeVerifier
      })
    });

    if (!tokenResponse.ok) {
      const detail = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${tokenResponse.status} ${detail}`);
    }

    const tokenPayload = await tokenResponse.json();
    const claims = await verifyIdentityToken(provider, discovery, tokenPayload.id_token, attempt.nonce);
    const identityUser = normalizeAuthenticatedUser(provider, claims);
    assertUserIsAllowed(identityUser);
    const account = await findExternalUserAccount(pool, identityUser.email);
    if (!account) {
      throw new Error(`External user ${identityUser.email} is not configured in SystemKontroll.`);
    }

    await markUserLogin(pool, account.id, provider.key);
    const user = userAccountToSessionUser(account, provider.key, identityUser);
    createAuthSession(res, user);
    res.redirect(attempt.returnTo);
  } catch (error) {
    console.error("Login callback failed", error);
    res.redirect("/?auth_error=login_failed");
  }
});

app.post("/api/auth/logout", (req, res) => {
  const sessionCookie = parseCookies(req.headers.cookie)[authConfig.cookieName];
  const sessionId = readSignedCookieValue(sessionCookie);
  if (sessionId) {
    authSessionStore.delete(sessionId);
  }
  clearAuthSessionCookie(res);
  res.json({ ok: true });
});

app.get("/openapi.json", (_req, res) => {
  res.json(buildOpenApiSpec());
});

app.get("/api/docs", (_req, res) => {
  res.type("html").send(renderSwaggerUiPage());
});

app.use("/api", requireAuthenticatedRequest);
app.use("/generated", requireAuthenticatedRequest);

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

app.get("/api/data/state", async (_req, res) => {
  try {
    const state = await readPersistedState(pool);
    res.json(state);
  } catch (error) {
    res.status(500).json({ error: "data_state_read_failed", detail: error.message });
  }
});

app.put("/api/data/state", requireEditorRequest, async (req, res) => {
  try {
    const savedState = await writePersistedState(pool, req.body);
    res.json(savedState);
  } catch (error) {
    res.status(500).json({ error: "data_state_write_failed", detail: error.message });
  }
});

app.get("/api/data/entities", async (_req, res) => {
  try {
    const state = await readPersistedState(pool);
    res.json({
      entities: Object.fromEntries(
        Object.entries(state.entities ?? {}).map(([entityKey, records]) => [
          entityKey,
          {
            count: Array.isArray(records) ? records.length : 0,
            records: Array.isArray(records) ? records : []
          }
        ])
      )
    });
  } catch (error) {
    res.status(500).json({ error: "data_entities_read_failed", detail: error.message });
  }
});

app.get("/api/data/entities/:entityKey", async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const records = getEntityCollection(state, req.params.entityKey);
    if (!records) {
      res.status(404).json({ error: "entity_not_found" });
      return;
    }
    res.json({ entityKey: req.params.entityKey, records });
  } catch (error) {
    res.status(500).json({ error: "data_entity_read_failed", detail: error.message });
  }
});

app.post("/api/data/entities/:entityKey", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const entityKey = req.params.entityKey;
    const records = getEntityCollection(state, entityKey);
    if (!records) {
      res.status(404).json({ error: "entity_not_found" });
      return;
    }
    const record = normalizeDataRecordPayload(req.body, entityKey);
    record.id = record.id || createDataRecordId(entityKey, records);
    if (records.some((candidate) => candidate.id === record.id)) {
      res.status(409).json({ error: "record_exists" });
      return;
    }
    records.push(record);
    const savedState = await writePersistedState(pool, state);
    const savedRecord = findDataRecord(savedState.entities?.[entityKey] ?? [], record.id);
    res.status(201).json({ record: savedRecord });
  } catch (error) {
    const statusCode = error?.code === "invalid_data_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "data_entity_create_failed", detail: error.message });
  }
});

app.get("/api/data/entities/:entityKey/:recordId", async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const records = getEntityCollection(state, req.params.entityKey);
    const record = records ? findDataRecord(records, req.params.recordId) : null;
    if (!record) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    res.json({ record });
  } catch (error) {
    res.status(500).json({ error: "data_record_read_failed", detail: error.message });
  }
});

app.put("/api/data/entities/:entityKey/:recordId", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const records = getEntityCollection(state, req.params.entityKey);
    if (!records) {
      res.status(404).json({ error: "entity_not_found" });
      return;
    }
    const recordIndex = records.findIndex((record) => record.id === req.params.recordId);
    if (recordIndex === -1) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    const record = normalizeDataRecordPayload(req.body, req.params.entityKey);
    records[recordIndex] = { ...record, id: req.params.recordId, entityKey: req.params.entityKey };
    const savedState = await writePersistedState(pool, state);
    res.json({ record: findDataRecord(savedState.entities?.[req.params.entityKey] ?? [], req.params.recordId) });
  } catch (error) {
    const statusCode = error?.code === "invalid_data_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "data_record_update_failed", detail: error.message });
  }
});

app.patch("/api/data/entities/:entityKey/:recordId", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const records = getEntityCollection(state, req.params.entityKey);
    if (!records) {
      res.status(404).json({ error: "entity_not_found" });
      return;
    }
    const recordIndex = records.findIndex((record) => record.id === req.params.recordId);
    if (recordIndex === -1) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    const patch = normalizeDataRecordPayload(req.body, req.params.entityKey, { allowPartial: true });
    records[recordIndex] = mergeDataRecord(records[recordIndex], patch, req.params.entityKey, req.params.recordId);
    const savedState = await writePersistedState(pool, state);
    res.json({ record: findDataRecord(savedState.entities?.[req.params.entityKey] ?? [], req.params.recordId) });
  } catch (error) {
    const statusCode = error?.code === "invalid_data_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "data_record_patch_failed", detail: error.message });
  }
});

app.delete("/api/data/entities/:entityKey/:recordId", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const records = getEntityCollection(state, req.params.entityKey);
    if (!records) {
      res.status(404).json({ error: "entity_not_found" });
      return;
    }
    const recordIndex = records.findIndex((record) => record.id === req.params.recordId);
    if (recordIndex === -1) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    const [deletedRecord] = records.splice(recordIndex, 1);
    await writePersistedState(pool, state);
    res.json({ deleted: true, record: deletedRecord });
  } catch (error) {
    res.status(500).json({ error: "data_record_delete_failed", detail: error.message });
  }
});

app.get("/api/data/records/:recordKey", async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const record = state.records?.[req.params.recordKey];
    if (!record) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    res.json({ record });
  } catch (error) {
    res.status(500).json({ error: "data_singleton_read_failed", detail: error.message });
  }
});

app.put("/api/data/records/:recordKey", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    if (!Object.hasOwn(state.records ?? {}, req.params.recordKey)) {
      res.status(404).json({ error: "record_not_found" });
      return;
    }
    state.records[req.params.recordKey] = normalizeDataRecordPayload(req.body, state.records[req.params.recordKey]?.entityKey ?? req.params.recordKey);
    const savedState = await writePersistedState(pool, state);
    res.json({ record: savedState.records?.[req.params.recordKey] });
  } catch (error) {
    const statusCode = error?.code === "invalid_data_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "data_singleton_write_failed", detail: error.message });
  }
});

app.get("/api/data/settings", async (_req, res) => {
  try {
    const state = await readPersistedState(pool);
    res.json({ settings: state.settings ?? {} });
  } catch (error) {
    res.status(500).json({ error: "data_settings_read_failed", detail: error.message });
  }
});

app.put("/api/data/settings", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    state.settings = isPlainDataObject(req.body?.settings) ? req.body.settings : req.body;
    const savedState = await writePersistedState(pool, state);
    res.json({ settings: savedState.settings ?? {} });
  } catch (error) {
    res.status(500).json({ error: "data_settings_write_failed", detail: error.message });
  }
});

app.get("/api/data/organization-structure", async (_req, res) => {
  try {
    const state = await readPersistedState(pool);
    res.json({ organizationStructure: state.organizationStructure ?? [] });
  } catch (error) {
    res.status(500).json({ error: "data_organization_read_failed", detail: error.message });
  }
});

app.put("/api/data/organization-structure", requireEditorRequest, async (req, res) => {
  try {
    const state = await readPersistedState(pool);
    const organizationStructure = Array.isArray(req.body?.organizationStructure) ? req.body.organizationStructure : req.body;
    if (!Array.isArray(organizationStructure)) {
      throwInvalidDataPayload("organizationStructure must be an array.");
    }
    state.organizationStructure = organizationStructure;
    const savedState = await writePersistedState(pool, state);
    res.json({ organizationStructure: savedState.organizationStructure ?? [] });
  } catch (error) {
    const statusCode = error?.code === "invalid_data_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "data_organization_write_failed", detail: error.message });
  }
});

app.get("/api/users", requireAdminRequest, async (_req, res) => {
  try {
    const users = await listUserAccounts(pool);
    res.json({ users });
  } catch (error) {
    res.status(500).json({ error: "users_read_failed", detail: error.message });
  }
});

app.post("/api/users", requireAdminRequest, async (req, res) => {
  try {
    const user = await createUserAccount(pool, req.body);
    res.status(201).json({ user });
  } catch (error) {
    const statusCode = error?.code === "invalid_user_payload" || error?.code === "duplicate_user" ? 400 : 500;
    res.status(statusCode).json({ error: "user_create_failed", detail: error.message });
  }
});

app.put("/api/users/:userId", requireAdminRequest, async (req, res) => {
  try {
    const user = await updateUserAccount(pool, req.params.userId, req.body);
    if (!user) {
      res.status(404).json({ error: "user_not_found" });
      return;
    }
    removeAuthSessionsForUser(user.id);
    res.json({ user });
  } catch (error) {
    const statusCode = error?.code === "invalid_user_payload" || error?.code === "duplicate_user" ? 400 : 500;
    res.status(statusCode).json({ error: "user_update_failed", detail: error.message });
  }
});

app.post("/api/users/:userId/password", requireAdminRequest, async (req, res) => {
  try {
    const user = await updateUserPassword(pool, req.params.userId, req.body?.password);
    if (!user) {
      res.status(404).json({ error: "user_not_found" });
      return;
    }
    removeAuthSessionsForUser(user.id);
    res.json({ user });
  } catch (error) {
    const statusCode = error?.code === "invalid_user_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "password_update_failed", detail: error.message });
  }
});

app.get("/api/api-keys", requireAdminRequest, async (_req, res) => {
  try {
    const apiKeys = await listApiKeys(pool);
    res.json({ apiKeys });
  } catch (error) {
    res.status(500).json({ error: "api_keys_read_failed", detail: error.message });
  }
});

app.post("/api/api-keys", requireAdminRequest, async (req, res) => {
  try {
    const created = await createApiKey(pool, req.body, req.authUser);
    res.status(201).json(created);
  } catch (error) {
    const statusCode = error?.code === "invalid_api_key_payload" ? 400 : 500;
    res.status(statusCode).json({ error: "api_key_create_failed", detail: error.message });
  }
});

app.post("/api/api-keys/:keyId/revoke", requireAdminRequest, async (req, res) => {
  try {
    const apiKey = await revokeApiKey(pool, req.params.keyId);
    if (!apiKey) {
      res.status(404).json({ error: "api_key_not_found" });
      return;
    }
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: "api_key_revoke_failed", detail: error.message });
  }
});

app.delete("/api/api-keys/:keyId", requireAdminRequest, async (req, res) => {
  try {
    const apiKey = await revokeApiKey(pool, req.params.keyId);
    if (!apiKey) {
      res.status(404).json({ error: "api_key_not_found" });
      return;
    }
    res.json({ apiKey });
  } catch (error) {
    res.status(500).json({ error: "api_key_revoke_failed", detail: error.message });
  }
});

app.post("/api/files", requireEditorRequest, async (req, res) => {
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

app.put("/api/state", requireEditorRequest, async (req, res) => {
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

  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS app_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      username TEXT,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'disabled')),
      local_enabled BOOLEAN NOT NULL DEFAULT false,
      password_hash TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login_at TIMESTAMPTZ,
      last_login_provider TEXT
    )
  `);

  await clientPool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS app_users_email_unique_idx
    ON app_users (LOWER(email))
  `);

  await clientPool.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS app_users_username_unique_idx
    ON app_users (LOWER(username))
    WHERE username IS NOT NULL AND username <> ''
  `);

  await clientPool.query(`
    CREATE TABLE IF NOT EXISTS app_api_keys (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      key_prefix TEXT NOT NULL,
      key_hash TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'editor', 'viewer')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
      created_by TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_used_at TIMESTAMPTZ,
      revoked_at TIMESTAMPTZ
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

async function seedUserAccounts(clientPool) {
  const existing = await clientPool.query("SELECT id FROM app_users LIMIT 1");
  if (existing.rowCount > 0 || !authConfig.localProvider.enabled || !authConfig.localProvider.hasBootstrapPassword) {
    return;
  }

  await clientPool.query(
    `
      INSERT INTO app_users (
        id, email, username, display_name, role, status, local_enabled, password_hash, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, 'admin', 'active', true, $5, NOW(), NOW())
    `,
    [
      randomUUID(),
      authConfig.localProvider.email,
      authConfig.localProvider.username,
      authConfig.localProvider.name,
      hashInitialLocalPassword(authConfig.localProvider)
    ]
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

function resolveAuthConfig() {
  const baseUrl = String(process.env.AUTH_BASE_URL || process.env.APP_BASE_URL || `http://localhost:${port}`)
    .trim()
    .replace(/\/+$/, "");
  const sessionSecret = String(process.env.AUTH_SESSION_SECRET ?? "").trim();
  const sessionHours = Math.max(1, Number(process.env.AUTH_SESSION_HOURS ?? 12));
  const cookieSecure = process.env.AUTH_COOKIE_SECURE
    ? process.env.AUTH_COOKIE_SECURE === "true"
    : baseUrl.startsWith("https://");
  const localProvider = resolveLocalProvider();
  const externalProviders = [
    resolveMicrosoftProvider(baseUrl),
    resolveGoogleProvider(baseUrl)
  ].filter(Boolean);
  const providers = [
    ...(localProvider.enabled ? [{ key: "local", label: "SystemKontroll", type: "local" }] : []),
    ...externalProviders
  ];
  const required = process.env.AUTH_REQUIRED === "true";

  if (required && sessionSecret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be set to at least 32 characters when AUTH_REQUIRED=true.");
  }
  if (required && providers.length === 0) {
    throw new Error("At least one login method must be configured when AUTH_REQUIRED=true.");
  }

  return {
    baseUrl,
    cookieName: "systemkontroll_session",
    cookieSecure,
    required,
    sessionMaxAgeMs: sessionHours * 60 * 60 * 1000,
    sessionSecret,
    allowedEmails: parseCsv(process.env.AUTH_ALLOWED_EMAILS).map((value) => value.toLowerCase()),
    allowedDomains: parseCsv(process.env.AUTH_ALLOWED_EMAIL_DOMAINS).map((value) =>
      value.toLowerCase().replace(/^@/, "")
    ),
    localProvider,
    providers
  };
}

function resolveLocalProvider() {
  const enabled = process.env.AUTH_LOCAL_ENABLED !== "false";
  const password = String(process.env.AUTH_LOCAL_PASSWORD ?? "").trim();
  const passwordSha256 = String(process.env.AUTH_LOCAL_PASSWORD_SHA256 ?? "").trim().toLowerCase();
  const hasPassword = Boolean(password || passwordSha256);

  return {
    enabled,
    hasBootstrapPassword: hasPassword,
    username: String(process.env.AUTH_LOCAL_USERNAME ?? "admin").trim() || "admin",
    email: String(process.env.AUTH_LOCAL_EMAIL ?? "admin@example.no").trim().toLowerCase() || "admin@example.no",
    name: String(process.env.AUTH_LOCAL_NAME ?? "SystemKontroll administrator").trim() || "SystemKontroll administrator",
    password,
    passwordSha256
  };
}

function resolveMicrosoftProvider(baseUrl) {
  const clientId = String(process.env.AUTH_MICROSOFT_CLIENT_ID ?? "").trim();
  const clientSecret = String(process.env.AUTH_MICROSOFT_CLIENT_SECRET ?? "").trim();
  if (!clientId || !clientSecret) {
    return null;
  }

  const tenantId = String(process.env.AUTH_MICROSOFT_TENANT_ID ?? "common").trim() || "common";
  return {
    key: "microsoft",
    label: "Microsoft Entra ID",
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/callback/microsoft`,
    scope: "openid email profile",
    discoveryUrl: `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/v2.0/.well-known/openid-configuration`,
    validateIssuer: !["common", "organizations", "consumers"].includes(tenantId.toLowerCase())
  };
}

function resolveGoogleProvider(baseUrl) {
  const clientId = String(process.env.AUTH_GOOGLE_CLIENT_ID ?? "").trim();
  const clientSecret = String(process.env.AUTH_GOOGLE_CLIENT_SECRET ?? "").trim();
  if (!clientId || !clientSecret) {
    return null;
  }

  return {
    key: "google",
    label: "Google",
    clientId,
    clientSecret,
    redirectUri: `${baseUrl}/api/auth/callback/google`,
    scope: "openid email profile",
    discoveryUrl: "https://accounts.google.com/.well-known/openid-configuration",
    prompt: "select_account",
    validateIssuer: true
  };
}

async function resolveProviderDiscovery(provider) {
  if (discoveryCache.has(provider.key)) {
    return discoveryCache.get(provider.key);
  }

  const response = await fetch(provider.discoveryUrl);
  if (!response.ok) {
    throw new Error(`Could not load OIDC discovery for ${provider.key}.`);
  }

  const discovery = await response.json();
  discoveryCache.set(provider.key, discovery);
  return discovery;
}

async function verifyIdentityToken(provider, discovery, idToken, nonce) {
  if (!idToken) {
    throw new Error("Identity provider did not return an id_token.");
  }

  const jwks = resolveRemoteJwks(provider, discovery.jwks_uri);
  const verifyOptions = {
    audience: provider.clientId,
    nonce
  };
  if (provider.validateIssuer && discovery.issuer) {
    verifyOptions.issuer = discovery.issuer;
  }

  const { payload } = await jwtVerify(idToken, jwks, verifyOptions);
  if (payload.nonce !== nonce) {
    throw new Error("Identity token nonce did not match login attempt.");
  }
  return payload;
}

function resolveRemoteJwks(provider, jwksUri) {
  if (!jwksCache.has(provider.key)) {
    jwksCache.set(provider.key, createRemoteJWKSet(new URL(jwksUri)));
  }
  return jwksCache.get(provider.key);
}

function normalizeAuthenticatedUser(provider, claims) {
  if (provider.key === "google" && claims.email_verified === false) {
    throw new Error("Google account email address is not verified.");
  }

  const email = String(claims.email || claims.preferred_username || claims.upn || "").trim().toLowerCase();
  const name = String(claims.name || email || "Innlogget bruker").trim();
  return {
    provider: provider.key,
    id: String(claims.sub ?? "").trim(),
    name,
    email
  };
}

function assertUserIsAllowed(user) {
  if (!user.email) {
    throw new Error("Innloggingen mangler e-postadresse.");
  }

  if (!authConfig.allowedEmails.length && !authConfig.allowedDomains.length) {
    return;
  }

  const email = user.email.toLowerCase();
  const domain = email.split("@").pop();
  if (authConfig.allowedEmails.includes(email) || authConfig.allowedDomains.includes(domain)) {
    return;
  }

  throw new Error(`User ${email} is not allowed to sign in.`);
}

async function listUserAccounts(clientPool) {
  const result = await clientPool.query(`
    SELECT id, email, username, display_name, role, status, local_enabled, created_at, updated_at, last_login_at, last_login_provider
    FROM app_users
    ORDER BY LOWER(display_name), LOWER(email)
  `);
  return result.rows.map(serializeUserAccount);
}

async function findLocalUserAccount(clientPool, identifier) {
  const normalizedIdentifier = String(identifier ?? "").trim().toLowerCase();
  if (!normalizedIdentifier) {
    return null;
  }

  const result = await clientPool.query(
    `
      SELECT *
      FROM app_users
      WHERE status = 'active'
        AND local_enabled = true
        AND password_hash IS NOT NULL
        AND (LOWER(email) = $1 OR LOWER(username) = $1)
      LIMIT 1
    `,
    [normalizedIdentifier]
  );
  return result.rows[0] ?? null;
}

async function findExternalUserAccount(clientPool, email) {
  const normalizedEmail = normalizeUserEmail(email);
  if (!normalizedEmail) {
    return null;
  }

  const result = await clientPool.query(
    `
      SELECT *
      FROM app_users
      WHERE status = 'active'
        AND LOWER(email) = $1
      LIMIT 1
    `,
    [normalizedEmail]
  );
  return result.rows[0] ?? null;
}

async function createUserAccount(clientPool, payload) {
  const normalized = normalizeUserPayload(payload, { requirePassword: Boolean(payload?.localEnabled) });
  const passwordHash = normalized.localEnabled ? hashPassword(normalized.password) : null;

  try {
    const result = await clientPool.query(
      `
        INSERT INTO app_users (
          id, email, username, display_name, role, status, local_enabled, password_hash, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING id, email, username, display_name, role, status, local_enabled, created_at, updated_at, last_login_at, last_login_provider
      `,
      [
        randomUUID(),
        normalized.email,
        normalized.username || null,
        normalized.displayName,
        normalized.role,
        normalized.status,
        normalized.localEnabled,
        passwordHash
      ]
    );
    return serializeUserAccount(result.rows[0]);
  } catch (error) {
    if (error?.code === "23505") {
      const duplicateError = new Error("E-post eller brukernavn finnes allerede.");
      duplicateError.code = "duplicate_user";
      throw duplicateError;
    }
    throw error;
  }
}

async function updateUserAccount(clientPool, userId, payload) {
  const normalized = normalizeUserPayload(payload, { partial: true });
  await assertActiveAdminWillRemain(clientPool, userId, normalized);

  try {
    const result = await clientPool.query(
      `
        UPDATE app_users
        SET email = $2,
            username = $3,
            display_name = $4,
            role = $5,
            status = $6,
            local_enabled = $7,
            password_hash = CASE WHEN $7 THEN password_hash ELSE NULL END,
            updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, username, display_name, role, status, local_enabled, created_at, updated_at, last_login_at, last_login_provider
      `,
      [
        userId,
        normalized.email,
        normalized.username || null,
        normalized.displayName,
        normalized.role,
        normalized.status,
        normalized.localEnabled
      ]
    );
    return result.rows[0] ? serializeUserAccount(result.rows[0]) : null;
  } catch (error) {
    if (error?.code === "23505") {
      const duplicateError = new Error("E-post eller brukernavn finnes allerede.");
      duplicateError.code = "duplicate_user";
      throw duplicateError;
    }
    throw error;
  }
}

async function assertActiveAdminWillRemain(clientPool, userId, normalized) {
  if (normalized.role === "admin" && normalized.status === "active") {
    return;
  }

  const result = await clientPool.query(
    `
      SELECT COUNT(*)::int AS admin_count
      FROM app_users
      WHERE id <> $1
        AND role = 'admin'
        AND status = 'active'
    `,
    [userId]
  );

  if (Number(result.rows[0]?.admin_count ?? 0) === 0) {
    throwInvalidUserPayload("Minst én aktiv administrator må finnes.");
  }
}

async function updateUserPassword(clientPool, userId, password) {
  const normalizedPassword = String(password ?? "");
  if (normalizedPassword.length < 10) {
    const error = new Error("Passord må være minst 10 tegn.");
    error.code = "invalid_user_payload";
    throw error;
  }

  const result = await clientPool.query(
    `
      UPDATE app_users
      SET local_enabled = true,
          password_hash = $2,
          updated_at = NOW()
      WHERE id = $1
      RETURNING id, email, username, display_name, role, status, local_enabled, created_at, updated_at, last_login_at, last_login_provider
    `,
    [userId, hashPassword(normalizedPassword)]
  );
  return result.rows[0] ? serializeUserAccount(result.rows[0]) : null;
}

async function markUserLogin(clientPool, userId, provider) {
  await clientPool.query(
    `
      UPDATE app_users
      SET last_login_at = NOW(), last_login_provider = $2, updated_at = NOW()
      WHERE id = $1
    `,
    [userId, provider]
  );
}

function normalizeUserPayload(payload = {}, options = {}) {
  const email = normalizeUserEmail(payload.email);
  const username = String(payload.username ?? "").trim();
  const displayName = String(payload.displayName ?? payload.display_name ?? "").trim();
  const role = String(payload.role ?? "viewer").trim();
  const status = String(payload.status ?? "active").trim();
  const localEnabled = Boolean(payload.localEnabled ?? payload.local_enabled ?? false);
  const password = String(payload.password ?? "");

  if (!email || !email.includes("@")) {
    throwInvalidUserPayload("Gyldig e-postadresse er påkrevd.");
  }
  if (!displayName) {
    throwInvalidUserPayload("Navn er påkrevd.");
  }
  if (!["admin", "editor", "viewer"].includes(role)) {
    throwInvalidUserPayload("Ugyldig rolle.");
  }
  if (!["active", "disabled"].includes(status)) {
    throwInvalidUserPayload("Ugyldig status.");
  }
  if (options.requirePassword && password.length < 10) {
    throwInvalidUserPayload("Lokale brukere må ha passord på minst 10 tegn.");
  }

  return {
    email,
    username,
    displayName,
    role,
    status,
    localEnabled,
    password
  };
}

function throwInvalidUserPayload(message) {
  const error = new Error(message);
  error.code = "invalid_user_payload";
  throw error;
}

function serializeUserAccount(row) {
  return {
    id: row.id,
    email: row.email,
    username: row.username ?? "",
    displayName: row.display_name,
    role: row.role,
    status: row.status,
    localEnabled: Boolean(row.local_enabled),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastLoginAt: row.last_login_at,
    lastLoginProvider: row.last_login_provider
  };
}

function userAccountToSessionUser(account, provider, identityUser = {}) {
  return {
    provider,
    id: account.id,
    name: account.display_name ?? identityUser.name ?? account.email,
    email: account.email,
    role: account.role,
    status: account.status
  };
}

function normalizeUserEmail(email) {
  return String(email ?? "").trim().toLowerCase();
}

async function listApiKeys(clientPool) {
  const result = await clientPool.query(`
    SELECT id, name, key_prefix, role, status, created_by, created_at, last_used_at, revoked_at
    FROM app_api_keys
    ORDER BY created_at DESC
  `);
  return result.rows.map(serializeApiKey);
}

async function createApiKey(clientPool, payload, authUser) {
  const name = String(payload?.name ?? "").trim();
  const role = String(payload?.role ?? "viewer").trim();
  if (!name) {
    throwInvalidApiKeyPayload("Navn er påkrevd.");
  }
  if (!["admin", "editor", "viewer"].includes(role)) {
    throwInvalidApiKeyPayload("Ugyldig rolle.");
  }

  const token = `sk_${createToken(32)}`;
  const keyPrefix = `${token.slice(0, 10)}...`;
  const result = await clientPool.query(
    `
      INSERT INTO app_api_keys (id, name, key_prefix, key_hash, role, status, created_by, created_at)
      VALUES ($1, $2, $3, $4, $5, 'active', $6, NOW())
      RETURNING id, name, key_prefix, role, status, created_by, created_at, last_used_at, revoked_at
    `,
    [randomUUID(), name, keyPrefix, hashApiKey(token), role, authUser?.email ?? authUser?.name ?? null]
  );
  return { apiKey: serializeApiKey(result.rows[0]), token };
}

async function revokeApiKey(clientPool, keyId) {
  const result = await clientPool.query(
    `
      UPDATE app_api_keys
      SET status = 'revoked', revoked_at = COALESCE(revoked_at, NOW())
      WHERE id = $1
      RETURNING id, name, key_prefix, role, status, created_by, created_at, last_used_at, revoked_at
    `,
    [keyId]
  );
  return result.rows[0] ? serializeApiKey(result.rows[0]) : null;
}

async function readApiKeySession(req) {
  const token = readApiKeyToken(req);
  if (!token) {
    return null;
  }

  const result = await pool.query(
    `
      UPDATE app_api_keys
      SET last_used_at = NOW()
      WHERE key_hash = $1
        AND status = 'active'
        AND revoked_at IS NULL
      RETURNING id, name, key_prefix, role, status, created_by, created_at, last_used_at, revoked_at
    `,
    [hashApiKey(token)]
  );
  const apiKey = result.rows[0];
  if (!apiKey) {
    return null;
  }

  return {
    user: {
      provider: "api_key",
      id: `api_key:${apiKey.id}`,
      name: apiKey.name,
      email: "",
      role: apiKey.role,
      status: "active"
    },
    apiKey: serializeApiKey(apiKey),
    createdAt: Date.now(),
    expiresAt: Date.now() + authConfig.sessionMaxAgeMs
  };
}

function readApiKeyToken(req) {
  const authorization = String(req.headers.authorization ?? "").trim();
  if (authorization.toLowerCase().startsWith("bearer ")) {
    return authorization.slice(7).trim();
  }
  return String(req.headers["x-api-key"] ?? "").trim();
}

function serializeApiKey(row) {
  return {
    id: row.id,
    name: row.name,
    keyPrefix: row.key_prefix,
    role: row.role,
    status: row.status,
    createdBy: row.created_by,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
    revokedAt: row.revoked_at
  };
}

function hashApiKey(token) {
  return createHash("sha256").update(String(token)).digest("hex");
}

function throwInvalidApiKeyPayload(message) {
  const error = new Error(message);
  error.code = "invalid_api_key_payload";
  throw error;
}

function getEntityCollection(state, entityKey) {
  const records = state.entities?.[entityKey];
  return Array.isArray(records) ? records : null;
}

function findDataRecord(records, recordId) {
  return records.find((record) => String(record?.id ?? "") === String(recordId)) ?? null;
}

function normalizeDataRecordPayload(payload, entityKey, options = {}) {
  const record = isPlainDataObject(payload?.record) ? payload.record : payload;
  if (!isPlainDataObject(record)) {
    throwInvalidDataPayload("Record payload must be an object.");
  }
  if (!options.allowPartial && !isPlainDataObject(record.fieldValues) && !isPlainDataObject(record.collectionValues)) {
    throwInvalidDataPayload("Record payload must include fieldValues or collectionValues.");
  }
  return {
    ...structuredClone(record),
    entityKey: String(record.entityKey ?? entityKey)
  };
}

function mergeDataRecord(existingRecord, patch, entityKey, recordId) {
  return {
    ...existingRecord,
    ...patch,
    id: recordId,
    entityKey,
    fieldValues: {
      ...(existingRecord.fieldValues ?? {}),
      ...(patch.fieldValues ?? {})
    },
    collectionValues: {
      ...(existingRecord.collectionValues ?? {}),
      ...(patch.collectionValues ?? {})
    },
    meta: {
      ...(existingRecord.meta ?? {}),
      ...(patch.meta ?? {})
    }
  };
}

function createDataRecordId(entityKey, records) {
  const fallbackPrefix = entityKey.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) || "REC";
  const prefix = {
    application: "APP",
    dataset: "DATA",
    controller_protocol: "CTRL",
    processor_protocol: "PROC"
  }[entityKey] ?? fallbackPrefix;
  const usedIds = new Set(records.map((record) => String(record?.id ?? "")));
  for (let index = records.length + 1; index < records.length + 10000; index += 1) {
    const candidate = `${prefix}-${String(index).padStart(3, "0")}`;
    if (!usedIds.has(candidate)) {
      return candidate;
    }
  }
  return `${prefix}-${randomUUID()}`;
}

function isPlainDataObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function throwInvalidDataPayload(message) {
  const error = new Error(message);
  error.code = "invalid_data_payload";
  throw error;
}

function createAuthSession(res, user) {
  const sessionId = createToken(48);
  const expiresAt = Date.now() + authConfig.sessionMaxAgeMs;
  authSessionStore.set(sessionId, { user, createdAt: Date.now(), expiresAt });
  setAuthSessionCookie(res, sessionId, expiresAt);
}

function removeAuthSessionsForUser(userId) {
  for (const [sessionId, session] of authSessionStore.entries()) {
    if (session?.user?.id === userId) {
      authSessionStore.delete(sessionId);
    }
  }
}

function hashInitialLocalPassword(localProvider) {
  if (localProvider.passwordSha256) {
    return `sha256$${localProvider.passwordSha256}`;
  }
  return hashPassword(localProvider.password);
}

function hashPassword(password) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(String(password), salt, 64).toString("base64url");
  return `scrypt$${salt}$${hash}`;
}

function verifyUserPassword(password, passwordHash) {
  if (!password || !passwordHash) {
    return false;
  }

  if (passwordHash.startsWith("scrypt$")) {
    const [, salt, expectedHash] = passwordHash.split("$");
    if (!salt || !expectedHash) {
      return false;
    }
    const actualHash = scryptSync(String(password), salt, 64).toString("base64url");
    return timingSafeStringEqual(actualHash, expectedHash);
  }

  if (passwordHash.startsWith("sha256$")) {
    const expectedHash = passwordHash.slice("sha256$".length);
    const actualHash = createHash("sha256").update(password).digest("hex");
    return timingSafeStringEqual(actualHash, expectedHash);
  }

  return false;
}

function timingSafeStringEqual(actual, expected) {
  const actualBuffer = Buffer.from(String(actual));
  const expectedBuffer = Buffer.from(String(expected));
  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

async function requireAuthenticatedRequest(req, res, next) {
  if (!authConfig.required) {
    next();
    return;
  }

  const session = await refreshAuthSession(readAuthSession(req));
  if (session) {
    req.authUser = session.user;
    next();
    return;
  }

  try {
    const apiKeySession = await readApiKeySession(req);
    if (apiKeySession) {
      req.authUser = apiKeySession.user;
      req.apiKey = apiKeySession.apiKey;
      next();
      return;
    }
  } catch (error) {
    next(error);
    return;
  }

  res.status(401).json({ error: "authentication_required" });
}

async function refreshAuthSession(session) {
  if (!session?.user || session.user.provider === "api_key") {
    return session;
  }

  const result = await pool.query(
    `
      SELECT *
      FROM app_users
      WHERE status = 'active'
        AND (id = $1 OR LOWER(email) = $2)
      LIMIT 1
    `,
    [session.user.id ?? "", String(session.user.email ?? "").toLowerCase()]
  );
  const account = result.rows[0];
  if (!account) {
    if (session.sessionId) {
      authSessionStore.delete(session.sessionId);
    }
    return null;
  }

  const refreshedSession = {
    ...session,
    user: userAccountToSessionUser(account, session.user.provider, session.user)
  };
  if (session.sessionId) {
    authSessionStore.set(session.sessionId, {
      user: refreshedSession.user,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt
    });
  }
  return refreshedSession;
}

function requireAdminRequest(req, res, next) {
  if (!authConfig.required || req.authUser?.role === "admin") {
    next();
    return;
  }

  res.status(403).json({ error: "admin_required" });
}

function requireEditorRequest(req, res, next) {
  if (!authConfig.required || ["admin", "editor"].includes(req.authUser?.role)) {
    next();
    return;
  }

  res.status(403).json({ error: "editor_required" });
}

function readAuthSession(req) {
  if (!authConfig.required) {
    return null;
  }

  const cookieValue = parseCookies(req.headers.cookie)[authConfig.cookieName];
  const sessionId = readSignedCookieValue(cookieValue);
  if (!sessionId) {
    return null;
  }

  const session = authSessionStore.get(sessionId);
  if (!session || session.expiresAt <= Date.now()) {
    authSessionStore.delete(sessionId);
    return null;
  }

  return { ...session, sessionId };
}

function setAuthSessionCookie(res, sessionId, expiresAt) {
  const signedValue = signCookieValue(sessionId);
  res.setHeader("Set-Cookie", serializeCookie(authConfig.cookieName, signedValue, {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: "Lax",
    path: "/",
    maxAge: Math.max(1, Math.floor((expiresAt - Date.now()) / 1000))
  }));
}

function clearAuthSessionCookie(res) {
  res.setHeader("Set-Cookie", serializeCookie(authConfig.cookieName, "", {
    httpOnly: true,
    secure: authConfig.cookieSecure,
    sameSite: "Lax",
    path: "/",
    maxAge: 0
  }));
}

function signCookieValue(value) {
  const signature = createHmac("sha256", authConfig.sessionSecret).update(value).digest("base64url");
  return `${value}.${signature}`;
}

function readSignedCookieValue(cookieValue) {
  if (!cookieValue || !authConfig.sessionSecret) {
    return "";
  }

  const [value, signature] = String(cookieValue).split(".");
  if (!value || !signature) {
    return "";
  }

  const expectedSignature = createHmac("sha256", authConfig.sessionSecret).update(value).digest("base64url");
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);
  if (signatureBuffer.length !== expectedBuffer.length || !timingSafeEqual(signatureBuffer, expectedBuffer)) {
    return "";
  }

  return value;
}

function serializeCookie(name, value, options = {}) {
  const segments = [`${name}=${encodeURIComponent(value)}`];
  if (options.maxAge !== undefined) {
    segments.push(`Max-Age=${options.maxAge}`);
  }
  if (options.path) {
    segments.push(`Path=${options.path}`);
  }
  if (options.httpOnly) {
    segments.push("HttpOnly");
  }
  if (options.secure) {
    segments.push("Secure");
  }
  if (options.sameSite) {
    segments.push(`SameSite=${options.sameSite}`);
  }
  return segments.join("; ");
}

function parseCookies(cookieHeader = "") {
  return Object.fromEntries(
    String(cookieHeader)
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf("=");
        if (separatorIndex === -1) {
          return [part, ""];
        }
        return [part.slice(0, separatorIndex), decodeURIComponent(part.slice(separatorIndex + 1))];
      })
  );
}

function normalizeLocalReturnTo(value) {
  const normalized = String(value ?? "/").trim() || "/";
  if (!normalized.startsWith("/") || normalized.startsWith("//")) {
    return "/";
  }
  return normalized;
}

function createToken(byteLength = 32) {
  return randomBytes(byteLength).toString("base64url");
}

function base64Url(buffer) {
  return Buffer.from(buffer).toString("base64url");
}

function parseCsv(value) {
  return String(value ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildOpenApiSpec() {
  const jsonOk = (schemaRef) => ({
    description: "OK",
    content: { "application/json": { schema: { $ref: schemaRef } } }
  });
  const errorResponse = {
    description: "Error",
    content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } }
  };

  return {
    openapi: "3.1.0",
    info: {
      title: "SystemKontroll API",
      version: "1.0.0",
      description: "APIs for authentication, user administration, API keys, and SystemKontroll data."
    },
    servers: [{ url: authConfig.baseUrl }],
    security: [{ bearerAuth: [] }, { apiKeyHeader: [] }, { cookieAuth: [] }],
    paths: {
      "/api/auth/local": {
        post: {
          tags: ["Authentication"],
          security: [],
          summary: "Log in with local credentials",
          requestBody: jsonRequest("#/components/schemas/LocalLoginRequest"),
          responses: { 200: jsonOk("#/components/schemas/AuthSession"), 401: errorResponse }
        }
      },
      "/api/auth/session": {
        get: {
          tags: ["Authentication"],
          security: [],
          summary: "Read current session",
          responses: { 200: jsonOk("#/components/schemas/AuthSession") }
        }
      },
      "/api/users": {
        get: { tags: ["Users"], summary: "List users", responses: { 200: jsonOk("#/components/schemas/UserList"), 403: errorResponse } },
        post: {
          tags: ["Users"],
          summary: "Create user",
          requestBody: jsonRequest("#/components/schemas/UserWrite"),
          responses: { 201: jsonOk("#/components/schemas/UserResponse"), 400: errorResponse, 403: errorResponse }
        }
      },
      "/api/users/{userId}": {
        put: {
          tags: ["Users"],
          summary: "Update user",
          parameters: [pathParameter("userId")],
          requestBody: jsonRequest("#/components/schemas/UserWrite"),
          responses: { 200: jsonOk("#/components/schemas/UserResponse"), 404: errorResponse }
        }
      },
      "/api/users/{userId}/password": {
        post: {
          tags: ["Users"],
          summary: "Set local user password",
          parameters: [pathParameter("userId")],
          requestBody: jsonRequest("#/components/schemas/PasswordUpdate"),
          responses: { 200: jsonOk("#/components/schemas/UserResponse"), 404: errorResponse }
        }
      },
      "/api/api-keys": {
        get: { tags: ["API keys"], summary: "List API keys", responses: { 200: jsonOk("#/components/schemas/ApiKeyList"), 403: errorResponse } },
        post: {
          tags: ["API keys"],
          summary: "Create API key",
          requestBody: jsonRequest("#/components/schemas/ApiKeyCreate"),
          responses: { 201: jsonOk("#/components/schemas/ApiKeyCreated"), 400: errorResponse, 403: errorResponse }
        }
      },
      "/api/api-keys/{keyId}/revoke": {
        post: {
          tags: ["API keys"],
          summary: "Revoke API key",
          parameters: [pathParameter("keyId")],
          responses: { 200: jsonOk("#/components/schemas/ApiKeyResponse"), 404: errorResponse }
        }
      },
      "/api/data/state": {
        get: { tags: ["Data"], summary: "Export full state", responses: { 200: jsonOk("#/components/schemas/AppState") } },
        put: {
          tags: ["Data"],
          summary: "Replace full state",
          requestBody: jsonRequest("#/components/schemas/AppState"),
          responses: { 200: jsonOk("#/components/schemas/AppState"), 403: errorResponse }
        }
      },
      "/api/data/entities": {
        get: { tags: ["Data"], summary: "List entity collections", responses: { 200: jsonOk("#/components/schemas/EntityCollections") } }
      },
      "/api/data/entities/{entityKey}": {
        get: {
          tags: ["Data"],
          summary: "List entity records",
          parameters: [pathParameter("entityKey")],
          responses: { 200: jsonOk("#/components/schemas/EntityRecords"), 404: errorResponse }
        },
        post: {
          tags: ["Data"],
          summary: "Create entity record",
          parameters: [pathParameter("entityKey")],
          requestBody: jsonRequest("#/components/schemas/DataRecordWrite"),
          responses: { 201: jsonOk("#/components/schemas/DataRecordResponse"), 409: errorResponse }
        }
      },
      "/api/data/entities/{entityKey}/{recordId}": {
        get: {
          tags: ["Data"],
          summary: "Read entity record",
          parameters: [pathParameter("entityKey"), pathParameter("recordId")],
          responses: { 200: jsonOk("#/components/schemas/DataRecordResponse"), 404: errorResponse }
        },
        put: {
          tags: ["Data"],
          summary: "Replace entity record",
          parameters: [pathParameter("entityKey"), pathParameter("recordId")],
          requestBody: jsonRequest("#/components/schemas/DataRecordWrite"),
          responses: { 200: jsonOk("#/components/schemas/DataRecordResponse"), 404: errorResponse }
        },
        patch: {
          tags: ["Data"],
          summary: "Patch entity record",
          parameters: [pathParameter("entityKey"), pathParameter("recordId")],
          requestBody: jsonRequest("#/components/schemas/DataRecordWrite"),
          responses: { 200: jsonOk("#/components/schemas/DataRecordResponse"), 404: errorResponse }
        },
        delete: {
          tags: ["Data"],
          summary: "Delete entity record",
          parameters: [pathParameter("entityKey"), pathParameter("recordId")],
          responses: { 200: jsonOk("#/components/schemas/DeleteResponse"), 404: errorResponse }
        }
      },
      "/api/data/records/{recordKey}": {
        get: {
          tags: ["Data"],
          summary: "Read singleton record",
          parameters: [pathParameter("recordKey")],
          responses: { 200: jsonOk("#/components/schemas/DataRecordResponse"), 404: errorResponse }
        },
        put: {
          tags: ["Data"],
          summary: "Replace singleton record",
          parameters: [pathParameter("recordKey")],
          requestBody: jsonRequest("#/components/schemas/DataRecordWrite"),
          responses: { 200: jsonOk("#/components/schemas/DataRecordResponse"), 404: errorResponse }
        }
      },
      "/api/data/settings": {
        get: { tags: ["Data"], summary: "Read settings", responses: { 200: jsonOk("#/components/schemas/SettingsResponse") } },
        put: {
          tags: ["Data"],
          summary: "Replace settings",
          requestBody: jsonRequest("#/components/schemas/SettingsResponse"),
          responses: { 200: jsonOk("#/components/schemas/SettingsResponse") }
        }
      },
      "/api/data/organization-structure": {
        get: { tags: ["Data"], summary: "Read organization structure", responses: { 200: jsonOk("#/components/schemas/OrganizationStructureResponse") } },
        put: {
          tags: ["Data"],
          summary: "Replace organization structure",
          requestBody: jsonRequest("#/components/schemas/OrganizationStructureResponse"),
          responses: { 200: jsonOk("#/components/schemas/OrganizationStructureResponse") }
        }
      }
    },
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "SystemKontroll API key" },
        apiKeyHeader: { type: "apiKey", in: "header", name: "X-API-Key" },
        cookieAuth: { type: "apiKey", in: "cookie", name: authConfig.cookieName }
      },
      schemas: buildOpenApiSchemas()
    }
  };
}

function buildOpenApiSchemas() {
  const freeObject = { type: "object", additionalProperties: true };
  const role = { type: "string", enum: ["admin", "editor", "viewer"] };
  return {
    Error: { type: "object", properties: { error: { type: "string" }, detail: { type: "string" } } },
    LocalLoginRequest: { type: "object", required: ["identifier", "password"], properties: { identifier: { type: "string" }, password: { type: "string", format: "password" } } },
    AuthSession: { type: "object", additionalProperties: true },
    User: { type: "object", additionalProperties: true, properties: { id: { type: "string" }, email: { type: "string" }, displayName: { type: "string" }, role, status: { type: "string", enum: ["active", "disabled"] }, localEnabled: { type: "boolean" } } },
    UserWrite: { type: "object", required: ["email", "displayName", "role", "status"], properties: { email: { type: "string" }, username: { type: "string" }, displayName: { type: "string" }, role, status: { type: "string", enum: ["active", "disabled"] }, localEnabled: { type: "boolean" }, password: { type: "string", format: "password" } } },
    UserList: { type: "object", properties: { users: { type: "array", items: { $ref: "#/components/schemas/User" } } } },
    UserResponse: { type: "object", properties: { user: { $ref: "#/components/schemas/User" } } },
    PasswordUpdate: { type: "object", required: ["password"], properties: { password: { type: "string", format: "password" } } },
    ApiKey: { type: "object", additionalProperties: true, properties: { id: { type: "string" }, name: { type: "string" }, keyPrefix: { type: "string" }, role, status: { type: "string", enum: ["active", "revoked"] } } },
    ApiKeyCreate: { type: "object", required: ["name", "role"], properties: { name: { type: "string" }, role } },
    ApiKeyCreated: { type: "object", properties: { apiKey: { $ref: "#/components/schemas/ApiKey" }, token: { type: "string" } } },
    ApiKeyList: { type: "object", properties: { apiKeys: { type: "array", items: { $ref: "#/components/schemas/ApiKey" } } } },
    ApiKeyResponse: { type: "object", properties: { apiKey: { $ref: "#/components/schemas/ApiKey" } } },
    AppState: { type: "object", additionalProperties: true },
    EntityCollections: { type: "object", additionalProperties: true },
    EntityRecords: { type: "object", properties: { entityKey: { type: "string" }, records: { type: "array", items: { $ref: "#/components/schemas/DataRecord" } } } },
    DataRecord: { type: "object", additionalProperties: true, properties: { id: { type: "string" }, entityKey: { type: "string" }, fieldValues: freeObject, collectionValues: freeObject, meta: freeObject } },
    DataRecordWrite: { type: "object", additionalProperties: true },
    DataRecordResponse: { type: "object", properties: { record: { $ref: "#/components/schemas/DataRecord" } } },
    DeleteResponse: { type: "object", properties: { deleted: { type: "boolean" }, record: { $ref: "#/components/schemas/DataRecord" } } },
    SettingsResponse: { type: "object", properties: { settings: freeObject } },
    OrganizationStructureResponse: { type: "object", properties: { organizationStructure: { type: "array", items: freeObject } } }
  };
}

function jsonRequest(schemaRef) {
  return { required: true, content: { "application/json": { schema: { $ref: schemaRef } } } };
}

function pathParameter(name) {
  return { name, in: "path", required: true, schema: { type: "string" } };
}

function renderSwaggerUiPage() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>SystemKontroll API Docs</title>
    <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: "/openapi.json",
        dom_id: "#swagger-ui",
        deepLinking: true,
        persistAuthorization: true
      });
    </script>
  </body>
</html>`;
}

function purgeExpiredAuthRecords() {
  const now = Date.now();
  for (const [state, attempt] of authAttemptStore.entries()) {
    if (now - attempt.createdAt > 10 * 60 * 1000) {
      authAttemptStore.delete(state);
    }
  }
  for (const [sessionId, session] of authSessionStore.entries()) {
    if (session.expiresAt <= now) {
      authSessionStore.delete(sessionId);
    }
  }
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
