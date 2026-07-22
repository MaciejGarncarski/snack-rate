import { createFileRoute } from "@tanstack/react-router";

import { getPool } from "@/infrastructure/db/pool";
import { readinessFailureCounter } from "@/observability/counters";
import { checkDb } from "@/observability/readiness/check-db";

export const Route = createFileRoute("/health/ready")({
  server: {
    handlers: {
      GET: async () => {
        const startedAt = performance.now();

        const dbResult = await checkDb(getPool(), 1000, 3);

        const durationMs = Math.round(performance.now() - startedAt);

        if (!dbResult.ok) {
          readinessFailureCounter.add(1, { check: "db" });

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
