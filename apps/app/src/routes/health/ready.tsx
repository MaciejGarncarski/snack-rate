import { S3Client } from "@aws-sdk/client-s3";
import { createFileRoute } from "@tanstack/react-router";

import { getPool } from "#/infrastructure/db/pool";
import { serverEnv } from "#/lib/server.env";
import { readinessFailureCounter } from "#/observability/counters";
import { checkDb } from "#/observability/readiness/check-db";
import { checkS3 } from "#/observability/readiness/check-s3";

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

export const Route = createFileRoute("/health/ready")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = performance.now();

        const [dbResult, s3Result] = await Promise.all([
          checkDb(getPool(), 1000, 3),
          checkS3(s3, serverEnv.S3_BUCKET_PUBLIC, 1000, 3),
        ]);

        const durationMs = Math.round(performance.now() - startedAt);

        if (!dbResult.ok || !s3Result.ok) {
          readinessFailureCounter.add(1, {
            check: !dbResult.ok ? "db" : "s3",
          });

          return Response.json(
            {
              status: "fail",
              checks: {
                db: {
                  status: dbResult.ok ? "ok" : "fail",
                  ...(!dbResult.ok && { error: dbResult.error }),
                },
                s3: {
                  status: s3Result.ok ? "ok" : "fail",
                  ...(!s3Result.ok && { error: s3Result.error }),
                },
              },
              durationMs,
            },
            {
              status: 503,
            },
          );
        }

        return Response.json(
          {
            status: "ok",
            checks: {
              db: {
                status: "ok",
              },
              s3: {
                status: "ok",
              },
            },
            durationMs,
          },
          {
            status: 200,
          },
        );
      },
    },
  },
});
