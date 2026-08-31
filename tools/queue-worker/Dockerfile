FROM node:26.8.1-slim AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ARG PNPM_VERSION=12.1.0
RUN npm install -g --allow-scripts=pnpm pnpm@${PNPM_VERSION}
RUN pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db-schema/package.json ./packages/db-schema/
COPY tools/queue-worker/package.json ./tools/queue-worker/
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

FROM base AS install
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY packages/db-schema ./packages/db-schema
COPY tools/queue-worker ./tools/queue-worker
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @snack-rate/queue-worker...
RUN pnpm deploy --filter @snack-rate/queue-worker --prod /app/deploy

FROM node:26.8.1-slim
WORKDIR /app
COPY --from=install /app/deploy .
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD kill -0 1 2>/dev/null || exit 1

CMD ["node", "--strip-types", "src/index.ts"]
