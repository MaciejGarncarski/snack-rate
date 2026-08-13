FROM node:26.7.0-alpine AS base
ARG PNPM_VERSION=12.0.0-rc.5
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@${PNPM_VERSION}
RUN pnpm config set store-dir /pnpm/store

FROM base AS builder
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db-schema ./packages/db-schema
COPY tools/db-tool ./tools/db-tool
RUN pnpm install --frozen-lockfile --filter @snack-rate/db-tool
RUN pnpm deploy --filter @snack-rate/db-tool --prod /app/deploy

FROM node:26.7.0-alpine
COPY --from=builder /app/deploy /app
ENV PATH="/app/node_modules/.bin:$PATH"
WORKDIR /app/node_modules/@snack-rate/db-schema
ENTRYPOINT ["sh", "-e", "-c", "drizzle-kit migrate && tsx drizzle/scripts/seed-prod.ts"]
