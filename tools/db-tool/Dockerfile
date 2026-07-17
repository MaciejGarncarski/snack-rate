FROM node:26.5.0-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.13.0
RUN pnpm config set store-dir /pnpm/store
WORKDIR /app

FROM base AS fetch
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch --frozen-lockfile

FROM base AS install
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db-schema ./packages/db-schema
COPY tools/db-tool ./tools/db-tool
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @snack-rate/db-schema...
RUN pnpm deploy --filter @snack-rate/db-schema /app/deploy

FROM base
COPY --from=install /app/deploy .
USER node
ENTRYPOINT ["sh", "-e", "-c", "pnpm exec drizzle-kit migrate && node drizzle/scripts/seed-prod.ts"]