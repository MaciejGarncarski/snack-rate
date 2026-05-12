import { createFileRoute } from "@tanstack/react-router";

import { readinessFailureCounter } from "#/lib/metrics/metrics";
import { checkDb } from "#/lib/readiness/check-db";

export const Route = createFileRoute("/health/ready")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = performance.now();

        const dbResult = await checkDb(1000);

        const durationMs = Math.round(performance.now() - startedAt);

        if (!dbResult.ok) {
          readinessFailureCounter.inc();

          return Response.json(
            {
              status: "fail",
              checks: {
                db: {
                  status: "fail",
                  error: dbResult.error,
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
