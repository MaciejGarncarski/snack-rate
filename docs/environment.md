# Environment variables

Copy `.env.example` to the appropriate file and fill in values before running anything.

| File               | Used for          |
| ------------------ | ----------------- |
| `.env.development` | Local development |
| `.env.production`  | Production stack  |
| `.env.staging`     | Staging stack     |

```bash
cp .env.example .env.development
```

Validation lives in `apps/app/src/lib/server.env.ts` (server) and
`apps/app/src/lib/client.env.ts` (client). The app exits on startup if
required server vars are missing or invalid.

## Application

| Variable   | Used in    | Description                                       |
| ---------- | ---------- | ------------------------------------------------- |
| `APP_PORT` | dev + prod | Application port (default 3000)                   |
| `NODE_ENV` | dev + prod | Runtime environment (`development`, `production`) |

## Turnstile (Cloudflare captcha)

| Variable                  | Used in    | Description                                                  |
| ------------------------- | ---------- | ------------------------------------------------------------ |
| `VITE_TURNSTILE_SITE_KEY` | dev + prod | Public site key, embedded in the client bundle at build time |
| `TURNSTILE_SECRET_KEY`    | dev + prod | Secret key, used server-side to verify tokens                |

Verification happens in `apps/app/src/infrastructure/turnstile.ts` against
`https://challenges.cloudflare.com/turnstile/v0/siteverify`, rendered via
`apps/app/src/components/turnstile-widget.tsx`.

> [!TIP]
> The values in `.env.example` (`1x00000000000000000000AA` / `1x0000...AA`)
> are Cloudflare's documented test keys that always pass. Use real keys from
> the Cloudflare dashboard in production/staging. Because `VITE_*` vars are
> baked in at build time, rebuild the image after changing the site key.

## Database

| Variable                  | Used in    | Description                                          |
| ------------------------- | ---------- | ---------------------------------------------------- |
| `POSTGRES_USER`           | dev + prod | Database user                                        |
| `POSTGRES_PASSWORD`       | dev + prod | Database password                                    |
| `POSTGRES_DB`             | dev + prod | Database name                                        |
| `DATABASE_URL`            | dev + prod | PostgreSQL connection string                         |
| `PG_BOSS_DB_URL`          | dev + prod | Queue worker database connection string              |
| `PG_BOSS_DB_URL_INTERNAL` | dev + prod | Queue worker db connection string (docker container) |
| `PG_BOSS_MAINTENANCE_DB`  | dev + prod | Queue worker maintenance DB (default: postgres)      |

`PG_BOSS_DB_URL` is used by the app, `PG_BOSS_DB_URL_INTERNAL` by services
running inside the Docker network (`tools/queue-worker`). In production they
are usually the same; in development they differ (`localhost` vs `postgres`
host).

## S3 / Storage

| Variable               | Used in    | Description                                 |
| ---------------------- | ---------- | ------------------------------------------- |
| `S3_ENDPOINT`          | dev + prod | S3-compatible endpoint (e.g. Garage)        |
| `S3_ENDPOINT_INTERNAL` | dev + prod | S3 endpoint used from inside Docker network |
| `S3_ACCESS_KEY`        | dev + prod | S3 access key                               |
| `S3_SECRET_KEY`        | dev + prod | S3 secret key                               |
| `S3_REGION`            | dev + prod | S3 region (e.g. `garage`)                   |
| `S3_BUCKET_PUBLIC`     | dev + prod | Bucket for public assets                    |

## Garage

| Variable               | Used in    | Description                   |
| ---------------------- | ---------- | ----------------------------- |
| `GARAGE_RPC_SECRET`    | dev + prod | Cluster RPC secret            |
| `GARAGE_ADMIN_TOKEN`   | dev + prod | Garage admin API token        |
| `GARAGE_METRICS_TOKEN` | dev + prod | Garage metrics endpoint token |

Generate secrets with `openssl rand -hex 32`.

## Mail (app)

Reserved for the app mail worker.

| Variable                 | Used in    | Description                 |
| ------------------------ | ---------- | --------------------------- |
| `MAIL_SMTP_HOST`         | dev + prod | SMTP host for app emails    |
| `MAIL_SMTP_PORT`         | dev + prod | SMTP port (e.g. 587)        |
| `MAIL_SMTP_USER`         | dev + prod | SMTP username               |
| `MAIL_SMTP_PASSWORD`     | dev + prod | SMTP password               |
| `MAIL_SMTP_FROM_ADDRESS` | dev + prod | From address for app emails |

## Observability

| Variable                        | Used in    | Description                      |
| ------------------------------- | ---------- | -------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT`   | dev + prod | OpenTelemetry collector endpoint |
| `OBSERVABILITY_LOG_LEVEL`       | dev + prod | Log level (e.g. debug, info)     |
| `OBSERVABILITY_METRICS_ENABLED` | dev + prod | Enable metrics collection        |
| `OBSERVABILITY_TRACING_ENABLED` | dev + prod | Enable distributed tracing       |

## Grafana

| Variable                    | Used in    | Description                         |
| --------------------------- | ---------- | ----------------------------------- |
| `GF_DOMAIN`                 | dev + prod | Grafana domain (`GF_SERVER_DOMAIN`) |
| `GF_SERVER_ROOT_URL`        | dev + prod | Grafana root URL                    |
| `GF_INITIAL_ADMIN_USER`     | dev + prod | Initial Grafana username            |
| `GF_INITIAL_ADMIN_PASSWORD` | dev + prod | Initial Grafana password            |
| `GF_SMTP`                   | dev + prod | SMTP host for Grafana alerts        |
| `GF_SMTP_USER`              | dev + prod | SMTP username                       |
| `GF_SMTP_PASSWORD`          | dev + prod | SMTP password                       |
| `GF_SMTP_FROM_ADDRESS`      | dev + prod | From address for alert emails       |

> [!IMPORTANT]
> `GF_INITIAL_*` variables only work on a fresh Grafana volume. Changes made after Grafana has been initialized will not be applied. Use `grafana-cli` instead.

`GF_SMTP_*` is only for Grafana alert notifications. App emails use `MAIL_SMTP_*`.

## Admin

| Variable         | Used in    | Description                                    |
| ---------------- | ---------- | ---------------------------------------------- |
| `ADMIN_PASSWORD` | dev + prod | Password for admin routes (default `admin123`) |

## Caddy

| Variable                  | Used in        | Description                                                     |
| ------------------------- | -------------- | --------------------------------------------------------------- |
| `CADDY_HOST_HTTP_PORT`    | prod + staging | Host-side HTTP port (default 80)                                |
| `CADDY_HOST_HTTPS_PORT`   | prod + staging | Host-side HTTPS port (default 443)                              |
| `APP_DOMAIN`              | prod           | Domain for app TLS (e.g. `app.example.com`)                     |
| `PUBLIC_BUCKET_DOMAIN`    | prod + staging | Public bucket domain (e.g. `s3.example.com`)                    |
| `PUBLIC_BUCKET_BACKEND`   | prod + staging | Internal Garage web endpoint to proxy to                        |
| `PUBLIC_BUCKET_HOST`      | prod + staging | Host header sent to Garage (e.g. `snack-rate-public.localhost`) |
| `STAGING_APP_DOMAIN`      | staging        | Domain for staging app (e.g. `staging.app.example.com`)         |
| `STAGING_BASIC_AUTH_USER` | staging        | Basic auth username for staging                                 |
| `STAGING_BASIC_AUTH_HASH` | staging        | Bcrypt hash for staging basic auth (use `pnpm hash-password`)   |
