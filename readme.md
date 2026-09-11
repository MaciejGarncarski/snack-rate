# Snack Rating App

## Why I created this project?

This project was built as an exercise in doing things “properly” from end to end. The main goal was to learn how to integrate a full observability stack and design a production-like development experience. After seeing many poorly built production applications, I decided to create this repository as an example of a cleaner and more maintainable approach.

The second goal was to build something people could actually use on a daily basis. When a new energy drink or snack comes out, users can quickly check ratings and decide whether it’s worth buying.

## Prerequisites

- Node.js 26
- pnpm
- Docker + Docker Compose

## Quick start — development

```bash
cp .env.example .env.development
pnpm install
pnpm infra:up
pnpm garage:init
pnpm db:migrate && pnpm db:seed
pnpm dev # → http://localhost:3000/  (or whatever APP_PORT is set to)
```

> [!NOTE]
> See `package.json` for all available scripts.

### Storybook

```bash
pnpm storybook          # start Storybook dev server on port 6006
pnpm build-storybook    # build static Storybook
```

## Tech stack

UI:

- React
- TanStack Start
- Tailwind CSS
- shadcn
- Storybook

API:

- oRPC
- TanStack Start API Routes

Database:

- PostgreSQL 18
- Drizzle ORM

Observability:

- Grafana Alloy — metrics/logs/traces collection
- Prometheus — metrics backend (remote write)
- Grafana — dashboards & alerting
- Tempo — distributed tracing
- Loki — log aggregation

Storage:

- Garage — S3-compatible object storage for app uploads and bucket hosting

## Environment variables

Copy `.env.example` to the appropriate file and fill in values before running anything.
See [`docs/environment.md`](docs/environment.md) for the full variable reference.

| File               | Used for          |
| ------------------ | ----------------- |
| `.env.development` | Local development |
| `.env.production`  | Production stack  |
| `.env.staging`     | Staging stack     |

## Database

### Migrations

```bash
pnpm db:generate          # generate migration files from schema changes
pnpm db:migrate           # apply pending migrations to local dev DB
pnpm db:push              # push schema directly (dev only)
pnpm db:pull              # pull schema from DB
```

### Seeding

```bash
pnpm db:seed               # seed local dev DB
pnpm db:seed-prod          # seed prod/staging DB (runs directly, no Docker)
```

Runs the script in `./drizzle/scripts/`. Edit them for your own purposes.

### Resetting

```bash
# Soft reset — clears data, keeps tables
pnpm db:reset

# Hard reset — removes everything including volumes
docker compose down && docker volume rm snack-rate_postgres_data
```

### Running database scripts in staging/prod

The staging and production compose overlays include a one-off `db-tool` service that uses the build stage of the app image.

```bash
pnpm db:migrate-and-seed-prod      # migrate + seed production
pnpm db:migrate-and-seed-staging   # migrate + seed staging
```

To run a different script, override the compose command:

```bash
docker compose -p snack-rate-staging -f compose.yml -f compose.staging.yml --env-file .env.staging run --rm db-tool pnpm db:seed-prod
```

### Schema diagram

See `./drizzle/docs/db-diagram.dbml`.

## Running — development

```bash
pnpm infra:up     # starts garage, postgres, grafana, prometheus, alloy, tempo, loki
pnpm garage:init  # configure garage key, bucket, and website hosting
pnpm dev          # starts app — port from APP_PORT env (default 3000)
```

> [!NOTE]
> Garage runs in a container with persistent volumes. Its S3 API is exposed on `http://localhost:3900`, the web endpoint on `http://localhost:3902`, and the admin API on `http://localhost:3903`.
>
> On first run (or after wiping Garage volumes), run `pnpm garage:init` to import the S3 access key, create the public bucket, set permissions, and enable website hosting.

## Running — production

Each environment is self-contained with its own Caddy reverse proxy. No shared networks or services between stacks.

```bash
pnpm prod:up
pnpm garage:init prod
```

### Services & URLs (production)

| Service    | URL                           | Notes               |
| ---------- | ----------------------------- | ------------------- |
| App        | `http(s)://localhost/`        | Proxied by Caddy    |
| Garage S3  | `http://localhost:3900`       | S3 API endpoint     |
| Garage web | `http://localhost:3902`       | Bucket website host |
| Grafana    | `http(s)://localhost/grafana` | Dashboards & alerts |
| Prometheus | internal only                 | Metrics backend     |
| Alloy      | internal only                 | Collector           |
| Tempo      | internal only                 | Traces              |
| Loki       | internal only                 | Logs                |

Caddy handles TLS automatically when `APP_DOMAIN` is set to a real domain. It also strips the `/grafana` prefix before forwarding to the Grafana container.

## Running — staging

```bash
pnpm staging:up
pnpm garage:init staging
```

Copy `.env.example` to `.env.staging` first. Use `pnpm hash-password yourpassword` to generate the bcrypt hash for `STAGING_BASIC_AUTH_HASH`.

## Backups

The `backup` service creates a PostgreSQL dump and uploads it to a local directory. It's designed to run as a one-off task (not a long-running service).

```bash
# Production
pnpm backup:run

# Staging
pnpm backup:run-staging
```

### Automated backups (cron)

```bash
pnpm backup:cron           # install cron job for production
pnpm backup:cron-staging   # install cron job for staging
```

This installs a system cron job that runs the backup daily. Backups are stored at `/var/backups/snack-rate/` on the host.

## Formatting & linting

```bash
pnpm fmt
pnpm lint
```

## File naming

I used kebab-case for files. Some files have .server.ts end, because of [TanStack Start behaviour](https://tanstack.com/start/latest/docs/framework/react/guide/import-protection#default-rules).
