import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/health/")({
  server: {
    handlers: {
      GET: () => {
        return new Response(JSON.stringify({ status: "ok" }), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      },
    },
  },
});
