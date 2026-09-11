import ms from "ms";
import { PgBoss, type SendOptions } from "pg-boss";

import { serverEnv } from "#/lib/server.env";
import { logger } from "#/observability/logger/logger";

let boss: PgBoss | null = null;

const dbUrl = serverEnv.PG_BOSS_DB_URL;

if (!dbUrl) {
  throw new Error("PG_BOSS_DB_URL is required");
}

export async function startQueue() {
  if (boss) return;

  boss = new PgBoss({
    connectionString: dbUrl,
    schema: "pgboss",
  });

  // oxlint-disable-next-line no-console
  boss.on("error", (err) => logger.error({ status: "pg-boss error", error: err }));

  await boss.start();

  logger.info({
    status: "Queue started",
  });
}

export async function stopQueue() {
  if (!boss) return;
  await boss.stop({ graceful: true, timeout: ms("30s") });
  boss = null;
  knownQueues.clear();
}

const knownQueues = new Set<string>();

async function ensureQueue(name: string): Promise<void> {
  if (!boss) throw new Error("queue not started, call startQueue() first");
  if (knownQueues.has(name)) return;
  // createQueue is idempotent — safe if the worker already created it.
  // This also removes the startup-order race between app and worker.
  await boss.createQueue(name);
  knownQueues.add(name);
}

export async function send<T = object>(
  name: string,
  data: T,
  options?: SendOptions,
): Promise<string | null> {
  if (!boss) throw new Error("queue not started, call startQueue() first");
  await ensureQueue(name);
  return boss.send(name, data as object, options);
}

export async function sendAfter<T = object>(
  name: string,
  data: T,
  options: SendOptions,
  delay: Date,
): Promise<string | null> {
  if (!boss) throw new Error("queue not started, call startQueue() first");
  await ensureQueue(name);
  return boss.sendAfter(name, data as object, options, delay);
}
