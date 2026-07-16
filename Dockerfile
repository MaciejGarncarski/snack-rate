ARG APP_PORT=3000

FROM node:26.5.0-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11
RUN pnpm config set store-dir /pnpm/store

FROM base AS fetch
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm fetch --frozen-lockfile

FROM base AS build
WORKDIR /app
COPY --from=fetch /pnpm/store /pnpm/store
COPY --from=fetch /app/node_modules ./node_modules
COPY . .
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
WORKDIR /app
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages ./packages
COPY --from=build /app/pnpm-lock.yaml ./
RUN pnpm install --prod --frozen-lockfile
EXPOSE ${APP_PORT}
CMD ["pnpm", "run", "start"]