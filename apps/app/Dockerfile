ARG APP_PORT=3000

FROM node:26.8.1-slim AS base
ARG PNPM_VERSION=12.3.1
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
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm fetch

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/app ./apps/app
COPY packages/db-schema ./packages/db-schema
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --filter @snack-rate/app...
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm --filter @snack-rate/app build

FROM node:26.8.1-slim
ARG APP_PORT=3000
WORKDIR /app
COPY --from=build /app/apps/app/.output ./
EXPOSE ${APP_PORT}
CMD ["node", "server/index.mjs"]
