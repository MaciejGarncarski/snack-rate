import pRetry from "p-retry";
import { Pool } from "pg";

import { env } from "#/env/env";
import { logger } from "#/lib/logger/logger";
import { readinessFailureCounter } from "#/lib/metrics/metrics";
import { checkDatabaseOnce } from "#/lib/readiness/check-db";

export async function runPreStartChecks() {
  if (env.isTesting) return;

  const timeoutMs = 1000;

  const pool = new Pool({
    connectionString: env.server.DATABASE_URL,
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
    readinessFailureCounter.inc();

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
