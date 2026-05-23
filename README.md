# SystemKontroll

SystemKontroll is a database-backed web application for municipal IT governance, compliance, data management, and operational oversight. It combines system inventories, dataset inventories, privacy protocol workflows, security checklists, organization modeling, and shared governance catalogs in one interface.

This README is intended to be a living project document. It should be updated whenever the app gains new top-level capabilities, new persistence rules, new workflows, or new deployment requirements.

## Purpose

The application exists to give one operational workspace for:

- keeping a structured inventory of applications and datasets
- documenting processing activities for controller and processor protocols
- tracking compliance work for NIS2 and NSM's grunnprinsipper for IKT-sikkerhet
- maintaining shared catalogs such as tags, standards, and common components
- connecting systems, datasets, roles, and organization structure instead of treating them as isolated spreadsheets

The product direction is not just "store fields in forms". The design leans toward a governance cockpit where relationships matter:

- applications can reference datasets, standards, common components, and labels
- datasets can reference applications and related processing activities
- controller and processor protocol records can reference datasets and organizational context
- shared tags and catalogs can be reused across modules instead of recreated locally in each record

## Product Areas

The current navigation is organized into three top-level areas:

- `Systemer`
  - `Applikasjoner`
  - `Datasett`
  - `Infrastruktur`
- `Etterlevelse`
  - `NIS2`
  - `Grunnprinsipper for IKT-sikkerhet`
  - `Behandlingsansvarlig protokoll`
  - `Databehandler protokoll`
- `Organisasjon`
  - `Roller`
  - `Organisasjonsstruktur`
  - `Innstillinger`

The screen registry for these areas is defined in [public/screen-specs.js](./public/screen-specs.js).

## Design Intent

The current UX and architecture suggest a few strong design principles:

1. One shell, many governance workflows.
The app uses a shared Fluent UI shell with consistent cards, tabs, tables, chips, dialogs, filters, and detail pages.

2. Editable, living records rather than static reports.
Most screens are designed for ongoing maintenance, not one-time form submission.

3. Shared catalogs instead of duplicated free text.
Tags, standards, and common components are centrally managed and reused across the app.

4. Relationship-first modeling.
Applications, datasets, processing activities, roles, and organization units are connected where possible.

5. Persisted operational state.
Changes are saved to PostgreSQL-backed application state and can be evolved over time.

## What the App Does Today

### Systems

`Applikasjoner` provides:

- an inventory list with search and overview metadata
- detailed application records with tabbed/sectioned editing
- relationships to datasets and related applications
- links, reviews, operations, finance, and experts
- shared labels, standards, and common components

`Datasett` provides:

- a central dataset inventory
- filters for hosting and privacy status
- detailed dataset records with characteristics, hosting, linked applications, related datasets, and related processing activities

`Infrastruktur` is currently lighter-weight than the application and dataset modules, but it is already wired into the navigation and can be extended into a more complete operational inventory.

### Compliance

`NIS2` provides:

- a municipality-oriented checklist and follow-up workspace
- local state persistence for ongoing compliance work

`Grunnprinsipper for IKT-sikkerhet` provides:

- a structured local follow-up model for NSM's principles
- editable records instead of static documentation

`Behandlingsansvarlig protokoll` and `Databehandler protokoll` provide:

- inventory-style overview pages
- detailed processing activity records
- organizational context and legal/security context
- relationships to datasets and other governance artifacts

### Organization and Shared Administration

`Roller` provides organization-wide administrative sections.

`Organisasjonsstruktur` provides a maintained organization tree that is also persisted separately in JSON for direct operational use.

`Innstillinger` provides shared catalogs and visual preferences, including:

- `Merkelapper`
- `Felleskomponenter`
- `Standarder`
- theme preferences such as appearance and accent

## Core Workflows

### 1. Application startup

On load, the frontend requests three resources:

- `/api/bootstrap`
- `/generated/systemkontroll-model.json`
- `/api/state`

These together provide:

- navigation and screen metadata
- the normalized model generated from YAML
- the persisted editable state

### 2. Editing existing records

Most detail pages work like this:

1. load the current record into UI state
2. edit fields or collections in-place
3. normalize the updated state client-side
4. persist the state through `PUT /api/state`
5. refresh the local app state with the normalized saved payload

This means the frontend is not just a thin form renderer. It performs substantial shaping and normalization before persistence.

### 3. Creating new records

The app supports draft-first creation for major entities such as:

- applications
- datasets
- controller protocol records
- processor protocol records

The flow is:

1. create a draft record in `records.*_draft`
2. route the user to a detail page in `mode=new`
3. let the user fill out the same kind of detail sections used by existing records
4. convert the draft into a new entity entry on save
5. persist the entire updated state

This lets "create" and "edit" reuse the same UX instead of maintaining separate codepaths and separate forms.

### 4. Shared tags and catalogs

The tag system is one of the clearest examples of the product philosophy.

Tags are:

- centrally managed in `settings.tagsCatalog`
- color-coded and reusable across modules
- selectable from existing values
- creatable inline from record editors
- removable either from a single record or from the global catalog

Important behavior:

- deleting a tag from a record only removes that record assignment
- deleting a tag from settings removes it globally and cleans references across records
- tag names are unique
- tag IDs are stable and generated from slugified names

The same catalog pattern is also used for standards and common components.

### 5. Collection editing

The app contains a flexible collection editor model for:

- scalar lists
- relations to other records
- file references
- link collections
- labels and catalog references
- organization affiliations

This is a key architectural choice: instead of hand-building every list widget independently, the app uses generalized collection editing behavior that adapts based on collection metadata.

### 6. File handling

The server accepts uploaded files through `/api/files`.

Files are stored in PostgreSQL as binary content in `uploaded_files`, with metadata such as:

- id
- file name
- mime type
- size
- created timestamp

The app can later retrieve them through `/api/files/:fileId`.

## Architecture

### High-level view

```mermaid
flowchart LR
    YAML["SystemKontroll_strukturer_med_hjelpetekster.yaml"] --> Build["scripts/build-data.mjs"]
    Specs["public/screen-specs.js"] --> API["Node/Express server"]
    Build --> Model["public/generated/systemkontroll-model.json"]
    Model --> Frontend["React + Fluent UI frontend"]
    API --> Frontend
    Frontend -->|GET /api/state| API
    Frontend -->|PUT /api/state| API
    API --> Postgres["PostgreSQL"]
    API --> OrgFile["public/organization-structure.json"]
```

### Runtime components

The runtime is intentionally compact:

- one Node/Express process
- one React frontend bundled with Vite
- one PostgreSQL database
- one generated JSON model produced from the YAML structure file

There is currently no split between a separately deployed frontend bundle and a separately deployed API. The Node server is responsible for:

- serving the API
- serving the frontend assets
- seeding and normalizing persisted state
- serving file download endpoints

### Tech stack

- `React 19`
- `@fluentui/react-components`
- `Express 5`
- `pg`
- `Vite`
- `PostgreSQL 16`
- `Docker` / `Docker Compose`

## Data and State Model

The app combines a few important sources of truth:

### 1. Static model source

[SystemKontroll_strukturer_med_hjelpetekster.yaml](./SystemKontroll_strukturer_med_hjelpetekster.yaml) is normalized into:

- [public/generated/systemkontroll-model.json](./public/generated/systemkontroll-model.json)

This is used to drive parts of the UI model and structure.

### 2. Static screen and seed metadata

[public/screen-specs.js](./public/screen-specs.js) defines:

- screen registry
- sidebar navigation
- top bar navigation
- settings catalog seeds
- inventory seed data
- mock records
- organization structure seed data

### 3. Persisted app state

The editable operational state is stored as a JSON document in PostgreSQL in the `app_state` table.

The server normalizes this state on read and write through:

- [scripts/persisted-state.mjs](./scripts/persisted-state.mjs)
- [frontend/src/utils.js](./frontend/src/utils.js)

### 4. Organization structure file

The organization structure is also read from and written to:

- [public/organization-structure.json](./public/organization-structure.json)

That makes it easier to keep the org structure available as an explicit artifact while still treating it as part of the wider persisted state.

## Persistence Logic

The server boot process in [scripts/dev-server.mjs](./scripts/dev-server.mjs) does several important things:

1. ensure the generated model exists
2. connect to PostgreSQL
3. wait for the database to become ready
4. create required tables if they do not exist
5. seed default persisted state if the database is empty

Current database tables:

- `app_state`
  - holds one JSONB document with the editable app state
- `uploaded_files`
  - stores binary file uploads and metadata

This means the persistence strategy is intentionally simple and pragmatic:

- one authoritative JSON state document for fast product iteration
- a dedicated file table for uploads

That is a strong fit for a rapidly evolving governance application where schema flexibility matters more than early table decomposition.

## Database Attachment Model

The Docker image is intended to be database-agnostic.

SystemKontroll does not require PostgreSQL to run in the same Compose project or even on the same machine. The application only needs:

- network reachability to a PostgreSQL server
- valid credentials
- permission to create and update the application tables it owns

### Connection modes

The application supports two connection styles:

1. `DATABASE_URL`
   Use a full PostgreSQL connection string when that is the easiest way to represent the target database.

2. `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
   Use individual environment variables when you want explicit per-field configuration.

If `DATABASE_URL` is set, it takes precedence over the individual `DB_*` variables.

Optional SSL is controlled with:

```bash
DATABASE_SSL=true
```

### Supported deployment patterns

This means the same Docker image can be used with all of these variants:

- PostgreSQL in another Docker container on the same Docker network
- PostgreSQL installed directly on the same Linux server as the app container
- PostgreSQL running on another Linux server
- PostgreSQL running on a Windows server
- any other reachable PostgreSQL-compatible endpoint that accepts the connection settings

### Examples

#### Example A: PostgreSQL in Docker on the same host/network

```bash
PORT=3000
DB_HOST=systemkontroll-db
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=systemkontroll
DATABASE_SSL=false
```

#### Example B: PostgreSQL installed locally on the same server

The app container must use a host name or IP address that is reachable from inside the container.

```bash
PORT=3000
DB_HOST=<server-hostname-or-ip>
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=<password>
DATABASE_SSL=false
```

#### Example C: remote PostgreSQL server

```bash
PORT=3000
DB_HOST=<remote-hostname-or-ip>
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=<password>
DATABASE_SSL=true
```

#### Example D: connection string

```bash
PORT=3000
DATABASE_URL=postgresql://systemkontroll:<password>@db.example.internal:5432/systemkontroll
DATABASE_SSL=true
```

### What the app creates in the target database

On startup, the app ensures these tables exist in the target PostgreSQL database:

- `app_state`
- `uploaded_files`

That means the database attachment is dynamic, but the app still assumes it is allowed to initialize and maintain its own storage objects inside the selected database.

## Repository Layout

```text
.
|-- frontend/
|   |-- src/
|   |   |-- App.jsx
|   |   |-- components.jsx
|   |   |-- main.jsx
|   |   |-- styles.css
|   |   `-- utils.js
|   `-- vite.config.mjs
|-- public/
|   |-- screen-specs.js
|   |-- organization-structure.json
|   |-- generated/
|   `-- ...
|-- scripts/
|   |-- build-data.mjs
|   |-- dev-server.mjs
|   |-- persisted-state.mjs
|   |-- validate-specs.mjs
|   `-- import-orgchart-html.mjs
|-- Dockerfile
|-- docker-compose.yml
|-- package.json
|-- README.md
`-- SystemKontroll_strukturer_med_hjelpetekster.yaml
```

## Local Development

### Prerequisites

- Node.js 22 or compatible current Node runtime
- npm
- PostgreSQL 16 if running without Docker
- Docker Desktop if running with Docker Compose

### Install dependencies

```bash
npm install
```

### Validate the project metadata

```bash
npm run validate
```

### Run against a local PostgreSQL instance

Create a local environment file based on `.env.example` and ensure PostgreSQL is available.

You can configure the database in either of these two ways:

1. a full `DATABASE_URL`
2. individual `DB_*` variables

Example with individual variables:

```bash
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=systemkontroll
ORG_STRUCTURE_PATH=./public/organization-structure.json
```

Example with a connection string:

```bash
PORT=3000
DATABASE_URL=postgresql://systemkontroll:systemkontroll@127.0.0.1:5432/systemkontroll
DATABASE_SSL=false
ORG_STRUCTURE_PATH=./public/organization-structure.json
```

Start the server:

```bash
npm start
```

The app is served from:

```text
http://localhost:3000
```

### Run with Docker Compose

```bash
docker compose pull
docker compose up -d
```

This starts:

- the prebuilt SystemKontroll app image from GitHub Container Registry
- the Node application on host port `3100` by default
- PostgreSQL 16 with a persistent named volume
- a bind-mounted `./data` folder for `organization-structure.json`

### Build steps

The build process has two explicit phases:

```bash
npm run build:data
npm run build:frontend
```

Or together:

```bash
npm run build
```

## Docker

### Dockerfile behavior

The Docker image:

1. installs dependencies with `npm ci --ignore-scripts`
2. copies the full project
3. runs `build:data`
4. runs `build:frontend`
5. starts the app with `npm start`

The container exposes port `3000`.

### Compose behavior

[docker-compose.yml](./docker-compose.yml) provides:

- `app`
- `db`

The app service uses the prebuilt image and does not build source code through Compose. It depends on the PostgreSQL health check and binds container port `3000` to host port `3100` by default.

## GitHub Actions and Docker Images

This repository includes a GitHub Actions workflow at:

- [.github/workflows/docker-image.yml](./.github/workflows/docker-image.yml)

The workflow is designed to:

- build the Docker image on pull requests
- build and publish the Docker image on pushes to `main`
- publish the image to GitHub Container Registry (`ghcr.io`)

Expected image path:

```text
ghcr.io/kjellmagne/systemkontroll
```

Typical tags include:

- `latest` on the default branch
- branch-derived tags when relevant
- short SHA tags

## Deployment Notes

Detailed deployment instructions are available in:

- [docs/deployment.md](./docs/deployment.md)
- [docs/computer-migration.md](./docs/computer-migration.md)

### Recommended deployment model

The current easiest deployment path is:

1. build and publish a Docker image from GitHub Actions
2. pull that image onto server `192.168.222.171`
3. run it with PostgreSQL in Docker through Docker Compose or `docker-compose`

Do not clone the repository or build source code on the server. The server should consume the image produced by GitHub Actions.

The important long-term design rule is:

- the Docker image should stay portable
- the production deployment for `192.168.222.171` should run both app and PostgreSQL as Docker containers
- the app should still attach to PostgreSQL through environment variables so the image remains reusable

### Secrets and credentials

Local credentials should not be committed into the repository history.

This project uses:

- `.env.example` for non-secret configuration shape
- a local-only `secrets.md` file for credentials kept on the workstation
- GitHub Actions secrets for hosted automation when needed

Suggested GitHub Secrets as the deployment process evolves:

- `GHCR_USERNAME`
- `GHCR_TOKEN`
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PASSWORD` or, preferably, SSH key material

## Ongoing README Maintenance

This README should be updated whenever any of the following changes:

- a new top-level product area or major screen is added
- a new persistence rule is introduced
- the shape of the Docker deployment changes
- new environment variables are required
- the relationship model between applications, datasets, and compliance records changes
- new catalogs or global editing patterns are introduced
- CI/CD behavior changes

At a minimum, each substantial feature change should answer:

1. what problem the feature solves
2. where it lives in the UI
3. how it persists data
4. how it affects related records or catalogs
5. whether deployment or operations changed

## Current Strengths

- coherent cross-domain governance model
- centralized shared catalogs
- relatively simple deployment topology
- strong reuse of UI patterns
- flexible JSONB-backed persistence for rapid iteration

## Future-Proof Backend Roadmap

The current backend choice is good:

- `Node/Express` is a practical API/runtime layer
- `PostgreSQL` is the right long-term database
- Docker packaging keeps deployment portable

What should evolve over time is not the core stack, but how responsibilities are separated inside it.

### Phase 1: Keep the current model, but make it deployment-safe

In the current phase, the app can continue to use:

- PostgreSQL as the primary persistence layer
- the existing JSONB-centered app state for fast-moving UI structures
- environment-based database attachment so the same image works with Docker PostgreSQL, local PostgreSQL, or remote PostgreSQL

This phase is about preserving speed while keeping deployments flexible.

### Phase 2: Add structured tables for operational features

As soon as the app starts managing real operational deadlines and lifecycle events, some concepts should move out of the general app-state blob and become first-class database tables.

Likely candidates:

- certificates
- contracts and renewals
- scheduled reviews
- tasks and follow-up items
- reminders and escalation rules

Why:

- these records usually need clear queryability
- they often need filtering by date, owner, status, and severity
- they are better suited for indexing and reporting than a generic JSON document

Recommended rule:

- keep flexible UI-heavy content in JSONB where that still makes sense
- move time-critical, reportable, and automatable business objects into normal relational tables

### Phase 3: Split web/API from background work

When the app starts sending emails or triggering actions on dates, add a separate worker process or worker container.

The web server should handle:

- UI/API requests
- validation
- persistence
- file upload/download

The worker should handle:

- scheduled checks
- deadline scanning
- reminder generation
- outbound email sending
- webhook or action triggering
- retry logic for failed notifications

This is an important future-proofing step because schedulers and background jobs are more reliable when they are not tied to the request-serving process.

### Phase 4: Introduce notification and automation tables

A minimal next-generation automation model would likely include tables such as:

- `scheduled_actions`
- `notifications`
- `notification_deliveries`
- `event_log`

Typical responsibilities:

- `scheduled_actions`
  - what should happen
  - when it should happen
  - which record/entity it belongs to
- `notifications`
  - the business reminder or alert to be sent
- `notification_deliveries`
  - each actual email/webhook delivery attempt
- `event_log`
  - immutable audit trail for backend-triggered events

This prevents duplicate reminders, improves auditability, and makes the system safer for compliance use cases.

### Phase 5: Add a real migration strategy

Once the backend contains more than the current bootstrap schema, database migrations should become explicit and versioned.

That likely means introducing:

- a migration tool
- versioned schema changes
- environment-safe rollout steps
- backup and rollback procedures

This becomes especially important when:

- multiple deployments exist
- production data is long-lived
- different customers or environments upgrade at different times

### Phase 6: Harden integrations and secrets

As external dependencies grow, the backend should standardize:

- SMTP or email-provider integration
- secret injection through environment variables or a secret manager
- SSL/TLS handling for PostgreSQL
- structured configuration for per-environment behavior

The app image should remain portable, while secrets and infrastructure-specific connection details remain externalized.

### Phase 7: Improve observability and recovery

For a mature operational deployment, the backend should eventually include:

- structured logs
- worker/job logs
- health checks for both app and worker
- backup procedures for PostgreSQL
- restore testing
- alerting for failed scheduled actions

This matters because the moment the app is responsible for deadlines, renewals, certificates, and reminders, missing a background job becomes a business issue, not just a technical one.

### Long-term architectural rule

The safest long-term direction is:

1. keep PostgreSQL as the core system of record
2. keep the app container portable and database-agnostic
3. keep flexible UI/state data where JSONB still adds value
4. introduce relational tables for important operational domains
5. run scheduled actions in a separate worker role
6. log backend-triggered events in an auditable way

That roadmap avoids overengineering too early, while still giving the project a clear path from "editable governance records" to "active operational platform."

## Current Limitations

- persistence is still centered on a single JSONB state document, which is great for iteration but will need careful governance as complexity grows
- the app currently mixes seed/spec/model concerns in a way that is productive, but may later deserve clearer separation
- the server and frontend are tightly coupled into one runtime, which is simple today but may limit scaling choices later
- automated deployment to long-lived servers is not fully defined yet

## Suggested Next Documentation Additions

As the project matures, the next useful docs would likely be:

- `docs/domain-model.md`
- `docs/deployment.md`
- `docs/computer-migration.md`
- `docs/admin-workflows.md`
- `docs/catalogs-and-tags.md`
- `docs/release-process.md`

Until then, this README should remain the main source of truth for product purpose, application flow, and deployment shape.
