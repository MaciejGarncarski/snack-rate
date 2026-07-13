FROM node:26-alpine
RUN npm install -g pnpm@11
WORKDIR /app

COPY tools/queue-worker/package.json ./
COPY tools/queue-worker/src ./src

RUN pnpm install --prod --no-frozen-lockfile

CMD ["node", "--strip-types", "src/index.ts"]
