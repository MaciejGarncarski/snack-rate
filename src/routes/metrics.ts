import { createFileRoute } from "@tanstack/react-router";

import { register } from "#/lib/metrics/metrics";

export const Route = createFileRoute("/metrics")({
  server: {
    handlers: {
      GET: async () => {
        const metrics = await register.metrics();

        return new Response(metrics, {
          headers: {
            "Content-Type": register.contentType,
          },
        });
      },
    },
  },
});
