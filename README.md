# SystemKontroll

This workspace now contains a database-backed Node application that serves the SystemKontroll UI and persists editable app-state in PostgreSQL.

## Commands

```bash
npm install
npm run validate
npm start
```

The app is served from `http://localhost:3000` by default.

## Environment

Copy `.env.example` if you want to run against a local PostgreSQL instance without Docker.

Required variables:

```bash
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432
DB_NAME=systemkontroll
DB_USER=systemkontroll
DB_PASSWORD=systemkontroll
```

## Docker

Start the full production-style stack with:

```bash
docker compose up --build
```

This starts:

- the Node app on port `3000`
- PostgreSQL 16 with a named Docker volume for persisted data

## What is implemented

- YAML-to-JSON normalization from `SystemKontroll_strukturer_med_hjelpetekster.yaml`
- Shared Fluent shell with top bar, side nav, tabs, cards, tables, and empty states
- PostgreSQL-backed persisted app-state for inventories, records, settings catalogs, and organisasjonsstruktur
- Static frontend and JSON model served from the same Node process as the API
- Coverage validation for entity screens and control mappings
