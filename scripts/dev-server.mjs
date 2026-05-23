import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { createHash, createHmac, randomBytes, randomUUID, timingSafeEqual } from "node:crypto";
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

app.get("/api/auth/session", (req, res) => {
  const session = readAuthSession(req);
  res.json({
    authRequired: authConfig.required,
    authenticated: Boolean(session),
    user: session?.user ?? null,
    providers: authConfig.providers.map(({ key, label, type }) => ({ key, label, type }))
  });
});

app.post("/api/auth/local", (req, res) => {
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
    const expectedIdentifiers = [authConfig.localProvider.username, authConfig.localProvider.email]
      .filter(Boolean)
      .map((value) => value.toLowerCase());

    if (!expectedIdentifiers.includes(identifier) || !verifyLocalPassword(password)) {
      res.status(401).json({ error: "invalid_credentials" });
      return;
    }

    const user = {
      provider: "local",
      id: authConfig.localProvider.username,
      name: authConfig.localProvider.name,
      email: authConfig.localProvider.email
    };
    assertUserIsAllowed(user);
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
    const user = normalizeAuthenticatedUser(provider, claims);
    assertUserIsAllowed(user);

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
    enabled: enabled && hasPassword,
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

function createAuthSession(res, user) {
  const sessionId = createToken(48);
  const expiresAt = Date.now() + authConfig.sessionMaxAgeMs;
  authSessionStore.set(sessionId, { user, createdAt: Date.now(), expiresAt });
  setAuthSessionCookie(res, sessionId, expiresAt);
}

function verifyLocalPassword(password) {
  if (!authConfig.localProvider.enabled || !password) {
    return false;
  }

  if (authConfig.localProvider.passwordSha256) {
    const actualHash = createHash("sha256").update(password).digest("hex");
    return timingSafeStringEqual(actualHash, authConfig.localProvider.passwordSha256);
  }

  return timingSafeStringEqual(password, authConfig.localProvider.password);
}

function timingSafeStringEqual(actual, expected) {
  const actualBuffer = Buffer.from(String(actual));
  const expectedBuffer = Buffer.from(String(expected));
  if (actualBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(actualBuffer, expectedBuffer);
}

function requireAuthenticatedRequest(req, res, next) {
  if (!authConfig.required) {
    next();
    return;
  }

  const session = readAuthSession(req);
  if (session) {
    req.authUser = session.user;
    next();
    return;
  }

  res.status(401).json({ error: "authentication_required" });
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

  return session;
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
