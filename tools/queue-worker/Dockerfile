FROM node:26.7.0-slim AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.20.0
RUN pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --frozen-lockfile

FROM base AS install
WORKDIR /app
COPY --from=fetch /pnpm/store /pnpm/store
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db-schema ./packages/db-schema
COPY tools/queue-worker ./tools/queue-worker
RUN pnpm install --offline --frozen-lockfile --filter @snack-rate/queue-worker...
RUN pnpm deploy --filter @snack-rate/queue-worker /app/deploy

FROM node:26.7.0-slim
WORKDIR /app
COPY --from=install /app/deploy .
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD kill -0 1 2>/dev/null || exit 1

CMD ["node", "--strip-types", "src/index.ts"]
