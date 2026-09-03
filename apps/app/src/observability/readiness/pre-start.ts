import { S3Client } from "@aws-sdk/client-s3";
import { Pool } from "pg";

import { serverEnv } from "#/lib/server.env";
import { readinessFailureCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { checkDb } from "#/observability/readiness/check-db";
import { checkS3 } from "#/observability/readiness/check-s3";

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
    const [dbResult, s3Result] = await Promise.all([
      checkDb(pool, timeoutMs, 4),
      checkS3(s3, serverEnv.S3_BUCKET_PUBLIC, timeoutMs, 4),
    ]);

    if (!dbResult.ok || !s3Result.ok) {
      throw new Error("Pre-start readiness check failed");
    }

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
