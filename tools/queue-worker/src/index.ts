import pRetry, { type RetryContext } from "p-retry";
import { Pool } from "pg";
import { PgBoss } from "pg-boss";
import pino from "pino";

import { handleImageProcessing } from "./image-processor.js";

const logger = pino({ name: "pg-boss" });
const queueDbUrl = process.env.PG_BOSS_DB_URL_INTERNAL ?? "";
const maintenanceDbName = process.env.PG_BOSS_MAINTENANCE_DB ?? "postgres";

if (!queueDbUrl) {
  logger.fatal("PG_BOSS_DB_URL_INTERNAL is required");
  process.exit(1);
}

const VALID_IDENTIFIER = /^[a-zA-Z_][a-zA-Z0-9_]*$/u;

async function ensureDatabase(): Promise<void> {
  const url = new URL(queueDbUrl);
  const dbName = url.pathname.replace(/^\//u, "");

  if (!VALID_IDENTIFIER.test(dbName)) {
    throw new Error(`refusing to auto-create database with unsafe name: "${dbName}"`);
  }

  url.pathname = `/${maintenanceDbName}`;
  const adminPool = new Pool({ connectionString: url.toString() });

  try {
    const { rows } = await adminPool.query("SELECT 1 FROM pg_database WHERE datname = $1", [
      dbName,
    ]);

    if (rows.length > 0) {
      return;
    }

    logger.info({ db: dbName }, "creating queue database");
    try {
      await adminPool.query(`CREATE DATABASE "${dbName}"`);
      logger.info({ db: dbName }, "queue database created");
    } catch (err) {
      if (err instanceof Error && "code" in err) {
        if (err.code === "42P04") {
          logger.info({ db: dbName }, "queue database already created by another instance");
        } else {
          throw err;
        }
      }
    }
  } finally {
    await adminPool.end();
  }
}

const boss = new PgBoss({
  connectionString: queueDbUrl,
  schema: "pgboss",
});

boss.on("error", (err) => logger.error(err, "pg-boss error"));
boss.on("stopped", () => logger.info("pg-boss stopped"));

async function startQueue(): Promise<void> {
  await ensureDatabase();

  await boss.start();
  logger.info("pg-boss worker started");

  await boss.work<{ message?: string }>("echo", { batchSize: 1 }, async ([job]) => {
    logger.info({ jobId: job.id, data: job.data }, "echo job");
    return { received: job.data };
  });

  await boss.work<{ key: string }>("image:resize", { batchSize: 1 }, async ([job]) => {
    logger.info({ jobId: job.id, key: job.data.key }, "processing image");
    return handleImageProcessing(job.data);
  });
}

async function startWithRetry(maxAttempts = 5, baseDelayMs = 2000): Promise<void> {
  await pRetry(() => startQueue(), {
    retries: maxAttempts - 1,
    minTimeout: baseDelayMs,
    factor: 2,
    onFailedAttempt: (context: RetryContext) => {
      logger.warn(
        {
          attempt: context.attemptNumber,
          retriesLeft: context.retriesLeft,
          retryDelay: context.retryDelay,
          err: context.error,
        },
        "failed to start pg-boss, retrying",
      );
    },
  });
}

let shuttingDown = false;

async function shutdown(signal: string): Promise<void> {
  if (shuttingDown) return;
  shuttingDown = true;

  logger.info({ signal }, "shutting down...");

  const forceExitTimer = setTimeout(() => {
    logger.error("graceful shutdown timed out, forcing exit");
    process.exit(1);
  }, 35000);
  forceExitTimer.unref();

  try {
    await boss.stop({ graceful: true, timeout: 30000 });
    clearTimeout(forceExitTimer);
    process.exit(0);
  } catch (err) {
    clearTimeout(forceExitTimer);
    logger.error(err, "error during shutdown");
    process.exit(1);
  }
}

process.on("SIGTERM", () => void shutdown("SIGTERM"));
process.on("SIGINT", () => void shutdown("SIGINT"));

try {
  await startWithRetry();
} catch (err) {
  logger.fatal(err, "failed to start pg-boss after retries");
  process.exit(1);
}
