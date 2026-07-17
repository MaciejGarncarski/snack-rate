FROM node:26.5.0-slim AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.13.0 \
    && pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --frozen-lockfile

FROM base AS install
WORKDIR /app
COPY --from=fetch /pnpm/store /pnpm/store
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY packages/db-schema ./packages/db-schema
COPY tools/db-tool ./tools/db-tool
RUN pnpm install --offline --frozen-lockfile --filter @snack-rate/db-schema...
RUN pnpm deploy --filter @snack-rate/db-schema /app/deploy

FROM node:26.5.0-slim
ENV NODE_ENV=production
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.13.0
WORKDIR /app
COPY --from=install /app/deploy .
USER node
ENTRYPOINT ["sh", "-e", "-c", "pnpm exec drizzle-kit migrate && node drizzle/scripts/seed-prod.ts"]