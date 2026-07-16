ARG APP_PORT=3000

FROM node:26.5.0-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g pnpm@11
RUN pnpm config set store-dir /pnpm/store
COPY . /app
WORKDIR /app

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

FROM deps AS build
RUN pnpm run build

FROM base
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./
COPY --from=build /app/pnpm-workspace.yaml ./
COPY --from=build /app/packages ./packages
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --prod --frozen-lockfile
EXPOSE ${APP_PORT}
CMD ["pnpm", "run", "start"]