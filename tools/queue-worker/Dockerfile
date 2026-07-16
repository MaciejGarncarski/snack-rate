FROM node:26.5.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm config set store-dir /pnpm/store
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY tools/queue-worker ./tools/queue-worker
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @snack-rate/queue-worker install --frozen-lockfile

FROM base
COPY --from=deps /app /app
WORKDIR /app/tools/queue-worker
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
  CMD pgrep -f "node.*src/index\\.ts" || exit 1

CMD ["node", "--strip-types", "src/index.ts"]
