import type { Pool } from "pg";

import { exponentialBackoff } from "#/lib/exponential-backoff";
import { dbFailuresCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";

type DbCheckResult = { ok: true } | { ok: false; error: string };

export async function checkDb(pool: Pool, timeoutMs: number, retries = 2): Promise<DbCheckResult> {
  try {
    await exponentialBackoff(() => checkDatabaseOnce(pool, timeoutMs), {
      factor: 2,
      retries: retries ?? 8,
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
