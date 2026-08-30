ARG APP_PORT=3000

FROM node:26.7.0-slim AS base
ARG PNPM_VERSION=12.1.0
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g --allow-scripts=pnpm pnpm@${PNPM_VERSION}
RUN pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/db-schema/package.json ./packages/db-schema/
COPY apps/app/package.json ./apps/app/
RUN pnpm fetch

FROM base AS build
WORKDIR /app
COPY --from=fetch /pnpm/store /pnpm/store
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/app ./apps/app
COPY packages/db-schema ./packages/db-schema
RUN pnpm install --offline --frozen-lockfile --filter @snack-rate/app...
RUN pnpm --filter @snack-rate/app build

FROM node:26.7.0-slim
ARG APP_PORT=3000
WORKDIR /app
COPY --from=build /app/apps/app/.output ./
EXPOSE ${APP_PORT}
CMD ["node", "server/index.mjs"]
