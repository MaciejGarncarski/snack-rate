// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { trace } from "@opentelemetry/api";
import { RPCHandler } from "@orpc/server/fetch";
import { createFileRoute } from "@tanstack/react-router";

import router from "#/orpc/router";

const handler = new RPCHandler(router, {
  interceptors: [
    ({ request, next }) => {
      const span = trace.getActiveSpan();

      request.signal?.addEventListener("abort", () => {
        span?.addEvent("aborted", { reason: String(request.signal?.reason) });
      });

      return next();
    },
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: {},
  });

  return response ?? new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/rpc/$")({
  server: {
    handlers: {
      HEAD: handle,
      GET: handle,
      POST: handle,
      PUT: handle,
      PATCH: handle,
      DELETE: handle,
    },
  },
});
