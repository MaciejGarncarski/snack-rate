import { S3Client } from "@aws-sdk/client-s3";
import { Pool } from "pg";

import { exponentialBackoff } from "#/lib/exponential-backoff";
import { serverEnv } from "#/lib/server.env";
import { readinessFailureCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { checkDatabaseOnce } from "#/observability/readiness/check-db";
import { checkS3Once } from "#/observability/readiness/check-s3";

export async function runPreStartChecks() {
  if (serverEnv.isTest) return;

  const timeoutMs = 1500;

  const pool = new Pool({
    connectionString: serverEnv.DATABASE_URL,
    max: 1,
  });

  const s3 = new S3Client({
    region: serverEnv.S3_REGION,
    endpoint: serverEnv.S3_ENDPOINT_INTERNAL,
    credentials: {
      accessKeyId: serverEnv.S3_ACCESS_KEY,
      secretAccessKey: serverEnv.S3_SECRET_KEY,
    },
    forcePathStyle: true,
    requestChecksumCalculation: "WHEN_REQUIRED",
  });

  try {
    await Promise.all([
      exponentialBackoff(() => checkDatabaseOnce(pool, timeoutMs), {
        factor: 2,
        retries: 4,
        minTimeout: 100,
        maxTimeout: 2000,
        logger,
        fnName: "checkDatabaseOnce",
      }),
      exponentialBackoff(() => checkS3Once(s3, serverEnv.S3_BUCKET_PUBLIC, timeoutMs), {
        factor: 2,
        retries: 4,
        minTimeout: 100,
        maxTimeout: 2000,
        logger,
        fnName: "checkS3Once",
      }),
    ]);

    logger.info({
      status: "Pre-start checks succeeded",
    });
  } catch (err) {
    readinessFailureCounter.add(1);

    logger.error({ err }, "Pre-start readiness check failed — exiting");

    throw err;
  } finally {
    try {
      await pool.end();
      s3.destroy();
    } catch (err) {
      logger.warn({ err }, "Failed to close resources");
    }
  }
}
