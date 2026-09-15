import { createFileRoute } from "@tanstack/react-router";

import { GIT_COMMIT_SHA } from "#/lib/build-info";

export const Route = createFileRoute("/health/")({
  server: {
    handlers: {
      GET: () => {
        return new Response(JSON.stringify({ status: "ok", commit: GIT_COMMIT_SHA }), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
