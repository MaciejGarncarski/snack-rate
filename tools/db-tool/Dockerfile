FROM node:26.5.0-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN pnpm config set store-dir /pnpm/store
WORKDIR /app

FROM base AS deps
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db-schema ./packages/db-schema
COPY tools/db-tool ./tools/db-tool
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @snack-rate/db-tool install --frozen-lockfile

FROM base
COPY --from=deps /app /app
WORKDIR /app/packages/db-schema
ENTRYPOINT ["sh", "-e", "-c", "pnpm exec drizzle-kit migrate && node drizzle/scripts/seed-prod.ts"]
