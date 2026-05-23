# Deployment Guide

This document describes how to deploy SystemKontroll.

The current production target is:

- server: `192.168.222.171`
- runtime: Docker images only
- app image: `ghcr.io/kjellmagne/systemkontroll:latest`
- database: PostgreSQL in Docker on the same server
- deployment method: pull the image built by GitHub Actions; do not clone the repository or build source code on the server

The guiding principle is:

- the SystemKontroll app image should stay portable
- the production deployment keeps PostgreSQL on the same server in Docker
- the app attaches to PostgreSQL through environment variables, even when both containers run in the same Compose project

The standard deployment is:

- PostgreSQL in Docker

External database variants are retained as reference notes only if the target architecture changes later.

## What SystemKontroll Needs

The app needs:

- a reachable PostgreSQL database
- credentials with permission to create and update its own tables
- a writable path for `organization-structure.json`
- an exposed HTTP port for the app container or reverse proxy

The app creates these tables automatically if they do not exist:

- `app_state`
- `uploaded_files`

## Connection Model

SystemKontroll supports two connection styles:

### Option A: connection string

```bash
DATABASE_URL=postgresql://systemkontroll:<password>@db-host:5432/systemkontroll
DATABASE_SSL=true
```

### Option B: individual settings

```bash
DB_HOST=db-host
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=<password>
DATABASE_SSL=false
```

If `DATABASE_URL` is set, it overrides the `DB_*` variables.

## Important Deployment Rule

Do not mount an empty host directory over `/app/public`.

The app image already contains its frontend assets and static files. If you bind-mount an empty directory onto `/app/public`, you will hide those files and break the app.

Instead, use a separate writable path for organization structure persistence, for example:

```bash
ORG_STRUCTURE_PATH=/data/organization-structure.json
```

Then mount a dedicated host folder to `/data`.

Example:

```bash
-v /opt/systemkontroll/data:/data
```

## Recommended Deployment Sequence

For the standard `192.168.222.171` deployment, the sequence should be:

1. Prepare the deployment folder and `.env`.
2. Prepare a persistent host directory for SystemKontroll runtime data.
3. Pull the SystemKontroll image from GHCR.
4. Start PostgreSQL and the app with Docker Compose.
5. Verify `/api/health`.
6. Put the app behind a reverse proxy if needed.

## Standard Runtime Settings

These settings are common across variants:

```bash
PORT=3000
ORG_STRUCTURE_PATH=/data/organization-structure.json
```

Recommended app data directory on Linux hosts:

```text
/opt/systemkontroll/data
```

Recommended host HTTP port if you do not already use a reverse proxy:

```text
3100
```

If your server already has many containers, choose a free port that does not collide with existing listeners.

## Login Configuration

SystemKontroll has its own built-in login and can optionally add Microsoft Entra ID/Azure AD and Google login buttons. Authentication is enabled only when:

```bash
AUTH_REQUIRED=true
```

If `AUTH_REQUIRED=true`, at least one login method must be configured and `AUTH_SESSION_SECRET` must contain at least 32 characters. The built-in SystemKontroll login is independent of Microsoft and Google, so the app can require login even before external identity providers are configured.

### Common authentication settings

For direct access on `http://192.168.222.171:3100`:

```bash
AUTH_REQUIRED=true
AUTH_BASE_URL=http://192.168.222.171:3100
AUTH_SESSION_SECRET=<long-random-secret>
AUTH_SESSION_HOURS=12
AUTH_COOKIE_SECURE=false
```

Generate a session secret on the server:

```bash
openssl rand -base64 48
```

If the app is later placed behind HTTPS, set:

```bash
AUTH_BASE_URL=https://<your-systemkontroll-hostname>
AUTH_COOKIE_SECURE=true
TRUST_PROXY=true
```

Optional allow-list controls:

```bash
AUTH_ALLOWED_EMAIL_DOMAINS=example.no,example.com
AUTH_ALLOWED_EMAILS=ola.nordmann@example.no,kari.nordmann@example.no
```

If both allow-list settings are empty, external identity providers are not restricted by domain. The user must still exist as an active SystemKontroll user.

Sessions are held in the app process and signed with `AUTH_SESSION_SECRET`. Restarting or recreating the app container logs users out, but does not affect saved application data.

### Built-in SystemKontroll login

Use this login method when Entra ID or Google is not configured yet, or keep it as an emergency/admin fallback.

The `.env` values below bootstrap the first administrator when the `app_users` table is empty. After the first admin user exists, manage users in the web app under **Innstillinger → Brukere**. Local passwords created in the web app are stored as hashes in Postgres.

```bash
AUTH_LOCAL_ENABLED=true
AUTH_LOCAL_USERNAME=admin
AUTH_LOCAL_EMAIL=admin@example.no
AUTH_LOCAL_NAME=SystemKontroll administrator
AUTH_LOCAL_PASSWORD=<strong-local-password>
```

Generate a strong local password:

```bash
openssl rand -base64 24
```

If you prefer not to keep the plain password in `.env`, store a SHA-256 hash instead:

```bash
printf '%s' '<strong-local-password>' | sha256sum
```

Then configure:

```bash
AUTH_LOCAL_PASSWORD=
AUTH_LOCAL_PASSWORD_SHA256=<sha256-hex-value>
```

Disable the built-in login only when another provider is ready:

```bash
AUTH_LOCAL_ENABLED=false
```

### User administration

Administrators manage users inside SystemKontroll under **Innstillinger → Brukere**.

Roles:

- `Administrator`: can manage users and edit data.
- `Redaktør`: can edit SystemKontroll data, but cannot manage users.
- `Lesetilgang`: can read data, but cannot save changes.

Local login:

- Enable **Tillat lokal innlogging** for users who should log in with SystemKontroll username/password.
- Set or reset their local password from the same user screen.

Microsoft Entra ID and Google login:

- Create the user in SystemKontroll with the same e-mail address as the Entra/Google account.
- The external identity provider performs authentication.
- SystemKontroll assigns role and access based on the matching active user row.

### API keys and OpenAPI

Administrators manage API keys inside SystemKontroll under **Innstillinger → API-nøkler**.

- API keys are shown only once when created.
- Store the generated key in a password manager or secret store.
- Revoke old keys from the same screen.
- API keys have the same roles as users: `Administrator`, `Redaktør`, and `Lesetilgang`.

Use API keys with either header:

```bash
Authorization: Bearer <systemkontroll-api-key>
```

or:

```bash
X-API-Key: <systemkontroll-api-key>
```

OpenAPI and Swagger documentation:

- OpenAPI JSON: `http://192.168.222.171:3100/openapi.json`
- Swagger UI: `http://192.168.222.171:3100/api/docs`

Primary API groups:

- `/api/users` for user administration. Requires `Administrator`.
- `/api/api-keys` for API key administration. Requires `Administrator`.
- `/api/data/...` for SystemKontroll data. `Lesetilgang` can read, `Redaktør` and `Administrator` can write.

### Microsoft Entra ID / Azure AD

In Microsoft Entra admin center:

1. Open **App registrations**.
2. Create a new registration for SystemKontroll.
3. Use account type **Single tenant** unless you intentionally need multi-tenant login.
4. Add a **Web** redirect URI:

```text
http://192.168.222.171:3100/api/auth/callback/microsoft
```

If using HTTPS later, add the HTTPS redirect URI too:

```text
https://<your-systemkontroll-hostname>/api/auth/callback/microsoft
```

5. Create a client secret under **Certificates & secrets**.
6. Copy the tenant ID, application/client ID, and client secret into `.env`.

Compose `.env` values:

```bash
AUTH_MICROSOFT_TENANT_ID=<directory-tenant-id>
AUTH_MICROSOFT_CLIENT_ID=<application-client-id>
AUTH_MICROSOFT_CLIENT_SECRET=<client-secret-value>
```

Use the actual secret **value**, not the secret ID.

### Google / Gmail

In Google Cloud Console:

1. Create or select a project.
2. Configure the OAuth consent screen.
3. Create an OAuth client ID of type **Web application**.
4. Add an authorized redirect URI:

```text
http://192.168.222.171:3100/api/auth/callback/google
```

If using HTTPS later, add the HTTPS redirect URI too:

```text
https://<your-systemkontroll-hostname>/api/auth/callback/google
```

5. Copy the client ID and client secret into `.env`.

Compose `.env` values:

```bash
AUTH_GOOGLE_CLIENT_ID=<google-client-id>
AUTH_GOOGLE_CLIENT_SECRET=<google-client-secret>
```

### Example with local login only

```bash
AUTH_REQUIRED=true
AUTH_BASE_URL=http://192.168.222.171:3100
AUTH_SESSION_SECRET=<long-random-secret>
AUTH_SESSION_HOURS=12
AUTH_COOKIE_SECURE=false

AUTH_LOCAL_ENABLED=true
AUTH_LOCAL_USERNAME=admin
AUTH_LOCAL_EMAIL=admin@example.no
AUTH_LOCAL_NAME=SystemKontroll administrator
AUTH_LOCAL_PASSWORD=<strong-local-password>

AUTH_MICROSOFT_TENANT_ID=
AUTH_MICROSOFT_CLIENT_ID=
AUTH_MICROSOFT_CLIENT_SECRET=
AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=
```

### Example with local, Microsoft, and Google

```bash
AUTH_REQUIRED=true
AUTH_BASE_URL=http://192.168.222.171:3100
AUTH_SESSION_SECRET=<long-random-secret>
AUTH_SESSION_HOURS=12
AUTH_COOKIE_SECURE=false
AUTH_ALLOWED_EMAIL_DOMAINS=example.no

AUTH_LOCAL_ENABLED=true
AUTH_LOCAL_USERNAME=admin
AUTH_LOCAL_EMAIL=admin@example.no
AUTH_LOCAL_NAME=SystemKontroll administrator
AUTH_LOCAL_PASSWORD=<strong-local-password>

AUTH_MICROSOFT_TENANT_ID=<directory-tenant-id>
AUTH_MICROSOFT_CLIENT_ID=<application-client-id>
AUTH_MICROSOFT_CLIENT_SECRET=<client-secret-value>

AUTH_GOOGLE_CLIENT_ID=<google-client-id>
AUTH_GOOGLE_CLIENT_SECRET=<google-client-secret>
```

After changing authentication settings, recreate the app container:

```bash
cd /opt/systemkontroll
docker compose up -d
```

## Image Source

Deploy the app by pulling the image published by GitHub Actions:

```bash
docker pull ghcr.io/kjellmagne/systemkontroll:latest
```

Do not clone the repository or run `docker build` on `192.168.222.171`.

If your server uses legacy Compose, replace:

- `docker compose`

with:

- `docker-compose`

## Variant 1: PostgreSQL in Docker

This is the most self-contained deployment model.

Use this when:

- you do not already have a PostgreSQL server
- you want app and database managed together
- you want Docker-native persistence through a named volume

### Sequence

1. Create the deployment folder.
2. Create the compose file and `.env`.
3. Start PostgreSQL and the app together.
4. Verify health.

### Suggested folder layout

```text
/opt/systemkontroll/
|-- compose.yml
|-- .env
`-- data/
```

### Example compose file

Save as `/opt/systemkontroll/compose.yml`:

```yaml
services:
  db:
    image: postgres:16-alpine
    container_name: systemkontroll-db
    restart: unless-stopped
    environment:
      POSTGRES_DB: systemkontroll
      POSTGRES_USER: systemkontroll
      POSTGRES_PASSWORD: change-me
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U systemkontroll -d systemkontroll"]
      interval: 10s
      timeout: 5s
      retries: 10
    volumes:
      - systemkontroll-postgres-data:/var/lib/postgresql/data

  app:
    image: ghcr.io/kjellmagne/systemkontroll:latest
    container_name: systemkontroll-app
    restart: unless-stopped
    depends_on:
      db:
        condition: service_healthy
    environment:
      PORT: 3000
      ORG_STRUCTURE_PATH: /data/organization-structure.json
      DATABASE_SSL: "false"
      AUTH_REQUIRED: "true"
      AUTH_BASE_URL: http://192.168.222.171:3100
      AUTH_SESSION_SECRET: change-this-to-a-long-random-secret
      AUTH_SESSION_HOURS: 12
      AUTH_COOKIE_SECURE: "false"
      AUTH_ALLOWED_EMAIL_DOMAINS: example.no
      AUTH_LOCAL_ENABLED: "true"
      AUTH_LOCAL_USERNAME: admin
      AUTH_LOCAL_EMAIL: admin@example.no
      AUTH_LOCAL_NAME: SystemKontroll administrator
      AUTH_LOCAL_PASSWORD: change-this-local-password
      AUTH_LOCAL_PASSWORD_SHA256: ""
      AUTH_MICROSOFT_TENANT_ID: ""
      AUTH_MICROSOFT_CLIENT_ID: ""
      AUTH_MICROSOFT_CLIENT_SECRET: ""
      AUTH_GOOGLE_CLIENT_ID: ""
      AUTH_GOOGLE_CLIENT_SECRET: ""
      DB_HOST: db
      DB_PORT: 5432
      DB_NAME: systemkontroll
      DB_USER: systemkontroll
      DB_PASSWORD: change-me
    ports:
      - "3100:3000"
    volumes:
      - ./data:/data

volumes:
  systemkontroll-postgres-data:
```

### Start it

If you have the modern Compose plugin:

```bash
cd /opt/systemkontroll
docker compose up -d
```

If you have legacy Compose:

```bash
cd /opt/systemkontroll
docker-compose up -d
```

### Verify

```bash
curl http://127.0.0.1:3100/api/health
```

Expected result:

```json
{"ok":true}
```

## Variant 2: Existing PostgreSQL on a Windows Server

Use this when:

- your organization already runs PostgreSQL on Windows
- the database should stay outside Docker
- SystemKontroll should only be the app container

### Sequence

1. Prepare PostgreSQL on the Windows server.
2. Open network access from the Linux app host to the Windows database host.
3. Create the database and app user on Windows PostgreSQL.
4. Start only the SystemKontroll app container on Linux.
5. Verify the app can connect and initialize its tables.

### Step 1: Prepare PostgreSQL on Windows

On the Windows PostgreSQL server:

1. Create a database, for example `systemkontroll`.
2. Create an application user, for example `systemkontroll`.
3. Grant that user sufficient rights on the target database.

Typical requirements:

- permission to connect
- permission to create tables
- permission to read and write data

### Step 2: Allow remote access on Windows PostgreSQL

Check PostgreSQL configuration:

- `postgresql.conf`
- `pg_hba.conf`

In `postgresql.conf`, ensure PostgreSQL listens on the needed interface:

```conf
listen_addresses = '*'
```

Or set it to the specific Windows server IP if you want tighter scoping.

In `pg_hba.conf`, allow the Linux app host to connect.

Example:

```conf
host    systemkontroll    systemkontroll    192.168.222.171/32    scram-sha-256
```

Adjust the IP to the real app host IP.

### Step 3: Open the Windows firewall

Open inbound TCP on the PostgreSQL port, usually `5432`, for the Linux app host or the relevant subnet.

### Step 4: Deploy the app container on Linux

Create the app runtime directory:

```bash
sudo mkdir -p /opt/systemkontroll/data
sudo chown -R $USER:$USER /opt/systemkontroll
```

Run the app container:

```bash
docker run -d \
  --name systemkontroll-app \
  --restart unless-stopped \
  -p 3100:3000 \
  -e PORT=3000 \
  -e ORG_STRUCTURE_PATH=/data/organization-structure.json \
  -e DATABASE_SSL=false \
  -e DB_HOST=<windows-postgres-host-or-ip> \
  -e DB_PORT=5432 \
  -e DB_NAME=systemkontroll \
  -e DB_USER=systemkontroll \
  -e DB_PASSWORD=<password> \
  -v /opt/systemkontroll/data:/data \
  ghcr.io/kjellmagne/systemkontroll:latest
```

If the Windows PostgreSQL server requires SSL:

```bash
-e DATABASE_SSL=true
```

### Step 5: Verify

```bash
curl http://127.0.0.1:3100/api/health
```

If it fails, test database reachability first from the Linux app host:

```bash
nc -zv <windows-postgres-host-or-ip> 5432
```

## Variant 3: PostgreSQL Installed Directly on a Linux Server

Use this when:

- the Linux server already runs PostgreSQL outside Docker
- you want PostgreSQL managed by the operating system
- you still want SystemKontroll packaged as a container

### Sequence

1. Install PostgreSQL on the Linux server.
2. Create the database and user.
3. Allow the app container to reach the database.
4. Start the app container.
5. Verify health.

### Step 1: Install PostgreSQL on Ubuntu

Example:

```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
```

### Step 2: Create database and user

```bash
sudo -u postgres psql
```

Then inside `psql`:

```sql
CREATE DATABASE systemkontroll;
CREATE USER systemkontroll WITH PASSWORD 'change-me';
GRANT ALL PRIVILEGES ON DATABASE systemkontroll TO systemkontroll;
\q
```

### Step 3: Allow the container to connect

Because the app runs in Docker and PostgreSQL runs on the Linux host OS, the container must reach the host database over a reachable address.

The simplest approach is:

1. make PostgreSQL listen on the server's actual IP address
2. point `DB_HOST` to that Linux server IP

In `postgresql.conf`:

```conf
listen_addresses = '*'
```

Or narrow it to the host IP if preferred.

In `pg_hba.conf`, allow the app host source.

If the app container runs on the same machine, using the machine's own IP is usually the simplest practical route.

Example:

```conf
host    systemkontroll    systemkontroll    192.168.222.171/32    scram-sha-256
```

If the app and PostgreSQL are on the same Linux server and you want to use a hostname, make sure it resolves from inside the container.

### Step 4: Start the app container

```bash
docker run -d \
  --name systemkontroll-app \
  --restart unless-stopped \
  -p 3100:3000 \
  -e PORT=3000 \
  -e ORG_STRUCTURE_PATH=/data/organization-structure.json \
  -e DATABASE_SSL=false \
  -e DB_HOST=192.168.222.171 \
  -e DB_PORT=5432 \
  -e DB_NAME=systemkontroll \
  -e DB_USER=systemkontroll \
  -e DB_PASSWORD=change-me \
  -v /opt/systemkontroll/data:/data \
  ghcr.io/kjellmagne/systemkontroll:latest
```

### Step 5: Verify

```bash
curl http://127.0.0.1:3100/api/health
```

## Variant 4: App and DB on Different Servers

This is just a generalized version of the Windows and Linux external DB variants.

Use it when:

- the app host and database host are separate
- the database is centrally managed
- network and firewall rules are already standardized

Sequence:

1. prepare database
2. allow network connectivity from the app host
3. create database and user
4. start the app with `DATABASE_URL` or `DB_*`
5. verify

Example:

```bash
docker run -d \
  --name systemkontroll-app \
  --restart unless-stopped \
  -p 3100:3000 \
  -e PORT=3000 \
  -e ORG_STRUCTURE_PATH=/data/organization-structure.json \
  -e DATABASE_URL=postgresql://systemkontroll:<password>@db.example.internal:5432/systemkontroll \
  -e DATABASE_SSL=true \
  -v /opt/systemkontroll/data:/data \
  ghcr.io/kjellmagne/systemkontroll:latest
```

## App-Only Compose for External PostgreSQL

If the database is external and you still want Compose for the app container, use a single-service compose file.

Example:

```yaml
services:
  app:
    image: ghcr.io/kjellmagne/systemkontroll:latest
    container_name: systemkontroll-app
    restart: unless-stopped
    environment:
      PORT: 3000
      ORG_STRUCTURE_PATH: /data/organization-structure.json
      DATABASE_SSL: "false"
      DB_HOST: <db-host>
      DB_PORT: 5432
      DB_NAME: systemkontroll
      DB_USER: systemkontroll
      DB_PASSWORD: <password>
    ports:
      - "3100:3000"
    volumes:
      - ./data:/data
```

Start it with:

```bash
docker compose up -d
```

or:

```bash
docker-compose up -d
```

## Upgrades

For upgrades, the sequence should normally be:

1. keep the database running
2. pull the new image
3. stop and recreate only the app container
4. verify health

If the database is in Docker and unchanged, do not remove its volume unless you intentionally want to destroy data.

### Example upgrade for app-only container

```bash
docker pull ghcr.io/kjellmagne/systemkontroll:latest
docker rm -f systemkontroll-app
docker run -d \
  --name systemkontroll-app \
  --restart unless-stopped \
  -p 3100:3000 \
  -e PORT=3000 \
  -e ORG_STRUCTURE_PATH=/data/organization-structure.json \
  -e DB_HOST=<db-host> \
  -e DB_PORT=5432 \
  -e DB_NAME=systemkontroll \
  -e DB_USER=systemkontroll \
  -e DB_PASSWORD=<password> \
  -v /opt/systemkontroll/data:/data \
  ghcr.io/kjellmagne/systemkontroll:latest
```

## Health and Verification Checklist

After every deployment:

1. check the container is running

```bash
docker ps
```

2. check the app health endpoint

```bash
curl http://127.0.0.1:3100/api/health
```

3. check logs if needed

```bash
docker logs systemkontroll-app
```

4. confirm the database is reachable if health fails

```bash
nc -zv <db-host> 5432
```

## Troubleshooting

### `database_unavailable`

Check:

- hostname/IP
- firewall rules
- PostgreSQL listen address
- `pg_hba.conf`
- SSL requirement
- username/password

### App starts but UI assets are missing

You probably mounted over `/app/public` with the wrong host directory. Remove that mount and use a dedicated data directory with `ORG_STRUCTURE_PATH=/data/organization-structure.json`.

### `docker compose` does not exist

Use:

```bash
docker-compose
```

instead.

### Database works but organization structure is not saved

Check:

- the mounted data directory exists
- `ORG_STRUCTURE_PATH` points into the mounted directory
- the container has write access

## Recommended Default Choice

If there is no existing PostgreSQL environment to integrate with, the recommended default is:

1. PostgreSQL in Docker
2. SystemKontroll app in Docker
3. a named volume for PostgreSQL
4. a bind-mounted `/data` folder for `organization-structure.json`
5. a reverse proxy in front if you later want `80/443`

If PostgreSQL already exists and is managed elsewhere, do not duplicate it just for this app. In that case, attach SystemKontroll to the existing database through environment variables and treat the app as an app-only container deployment.
