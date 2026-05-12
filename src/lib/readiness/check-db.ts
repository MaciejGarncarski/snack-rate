import pRetry from "p-retry";
import type { Pool } from "pg";

import { dbPool } from "#/db";
import { logger } from "#/lib/logger/logger";

type DbCheckResult = { ok: true } | { ok: false; error: string };

export async function checkDb(timeoutMs: number, retries = 2): Promise<DbCheckResult> {
  try {
    await pRetry(() => checkDatabaseOnce(dbPool, timeoutMs), {
      retries,
      minTimeout: 100,
      maxTimeout: 200,
      factor: 1,
      onFailedAttempt: (error) => {
        logger.warn(
          {
            err: error,
            attempt: error.attemptNumber,
            retriesLeft: error.retriesLeft,
          },
          "Database readiness attempt failed",
        );
      },
    });

    return { ok: true };
  } catch (err) {
    logger.error({ err }, "Database readiness check failed");
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkDatabaseOnce(pool: Pool, timeoutMs: number) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });

  await Promise.race([pool.query("SELECT 1"), timeout]);
}
