import { Pool } from "pg";

import { serverEnv } from "#/env/server.env";
import { readinessFailureCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { checkDatabaseOnce } from "#/observability/readiness/check-db";
import { exponentialBackoff } from "#/utils/exponential-backoff";

export async function runPreStartChecks() {
  if (serverEnv.isTest) return;

  const timeoutMs = 1000;

  const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
    max: 1,
  });

  try {
    await exponentialBackoff(() => checkDatabaseOnce(pool, timeoutMs), {
      factor: 2,
      retries: 8,
      minTimeout: 100,
      maxTimeout: 5000,
      logger,
      fnName: "checkDatabaseOnce",
    });

    logger.info({
      status: "Pre-start DB check succeeded",
    });
  } catch (err) {
    readinessFailureCounter.add(1);

    logger.error({ err }, "Pre-start readiness check failed — exiting");

    throw err;
  } finally {
    try {
      await pool.end();
    } catch (err) {
      logger.warn({ err }, "Failed to close DB pool");
    }
  }
}
