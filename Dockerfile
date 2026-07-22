ARG APP_PORT=3000

FROM node:26.5.0-slim AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11.15.1
RUN pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=fetch /pnpm/store /pnpm/store
COPY . .
RUN pnpm install --offline --frozen-lockfile
RUN pnpm run build

FROM node:26.5.0-slim
ARG APP_PORT=3000
WORKDIR /app
COPY --from=build /app/.output ./
EXPOSE ${APP_PORT}
CMD ["node", "server/index.mjs"]