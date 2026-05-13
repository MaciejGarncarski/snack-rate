import pRetry from "p-retry";
import { Pool } from "pg";

import { serverEnv } from "#/env/server.env";
import { readinessFailureCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { checkDatabaseOnce } from "#/observability/readiness/check-db";

export async function runPreStartChecks() {
  if (serverEnv.isTest) return;

  const timeoutMs = 1000;

  const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
    max: 1,
  });

  try {
    await pRetry(() => checkDatabaseOnce(pool, timeoutMs), {
      retries: 2,
      factor: 1,
      minTimeout: 200,
      maxTimeout: 200,
      onFailedAttempt: (err) => {
        logger.warn(
          {
            err,
            attempt: err.attemptNumber,
            retriesLeft: err.retriesLeft,
          },
          "Pre-start DB check attempt failed",
        );
      },
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
