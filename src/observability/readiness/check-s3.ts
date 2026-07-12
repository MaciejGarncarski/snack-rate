import { HeadBucketCommand, S3Client } from "@aws-sdk/client-s3";

import { exponentialBackoff } from "#/lib/exponential-backoff";
import { s3FailuresCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";

type S3CheckResult = { ok: true } | { ok: false; error: string };

export async function checkS3(
  s3: S3Client,
  bucket: string,
  timeoutMs: number,
  retries = 2,
): Promise<S3CheckResult> {
  try {
    await exponentialBackoff(() => checkS3Once(s3, bucket, timeoutMs), {
      factor: 2,
      retries: retries ?? 8,
      minTimeout: 100,
      maxTimeout: 1000,
      logger,
      fnName: "checkS3Once",
    });

    return { ok: true };
  } catch (err) {
    s3FailuresCounter.add(1);

    logger.error({ err }, "S3 readiness check failed");
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function checkS3Once(s3: S3Client, bucket: string, timeoutMs: number) {
  const timeout = new Promise((_, reject) => {
    setTimeout(() => reject(new Error("timeout")), timeoutMs);
  });

  await Promise.race([s3.send(new HeadBucketCommand({ Bucket: bucket })), timeout]);
}
