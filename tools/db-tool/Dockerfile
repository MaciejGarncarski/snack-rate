ARG PNPM_VERSION=12.21.0

FROM ghcr.io/pnpm/pnpm:${PNPM_VERSION}-alpine AS pnpm

FROM node:26.13.0-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
COPY --from=pnpm /opt/pnpm /opt/pnpm
RUN for bin in pnpm pn pnpx pnx; do ln -s "/opt/pnpm/$bin" "/usr/local/bin/$bin"; done
RUN pnpm config set store-dir /pnpm/store

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db-schema ./packages/db-schema
COPY tools/db-tool ./tools/db-tool
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @snack-rate/db-tool
RUN pnpm deploy --filter @snack-rate/db-tool --prod /app/deploy

FROM node:26.13.0-alpine
COPY --from=builder /app/deploy /app
ENV PATH="/app/node_modules/.bin:$PATH"
WORKDIR /app/node_modules/@snack-rate/db-schema
ENTRYPOINT ["sh", "-e", "-c", "drizzle-kit migrate && tsx drizzle/scripts/seed-prod.ts"]
