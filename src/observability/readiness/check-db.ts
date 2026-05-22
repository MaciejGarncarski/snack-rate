import type { Pool } from "pg";

import { dbPool } from "#/db/db.server";
import { dbFailuresCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { exponentialBackoff } from "#/utils/exponential-backoff";

type DbCheckResult = { ok: true } | { ok: false; error: string };

export async function checkDb(timeoutMs: number, retries = 2): Promise<DbCheckResult> {
  try {
    await exponentialBackoff(() => checkDatabaseOnce(dbPool, timeoutMs), {
      factor: 2,
      retries: 8,
      minTimeout: 100,
      maxTimeout: 5000,
      logger,
      fnName: "checkDatabaseOnce",
    });

    return { ok: true };
  } catch (err) {
    dbFailuresCounter.add(1);

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
