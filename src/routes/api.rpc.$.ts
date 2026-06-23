import { trace } from "@opentelemetry/api";

// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createFileRoute } from "@tanstack/react-router";

import { logger } from "#/observability/logger/logger";
import { mapError } from "#/orpc/map-error";
import router from "#/orpc/router";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");

const handler = new RPCHandler(router, {
  adapterInterceptors: [
    (options) => {
      return options.next({
        ...options,
        context: {
          ...options.context,
          [OVERRIDE_BODY_CONTEXT as any]: {
            fetchRequest: options.request,
          },
        },
      });
    },
  ],
  rootInterceptors: [
    (options) => {
      const { fetchRequest } = ((options.context as any)[OVERRIDE_BODY_CONTEXT] as
        | {
            fetchRequest: Request;
          }
        | undefined) ?? { fetchRequest: undefined };

      if (!fetchRequest) {
        return options.next(options);
      }

      return options.next({
        ...options,
        request: {
          ...options.request,
          body() {
            const contentType = fetchRequest.headers.get("content-type");

            if (contentType?.startsWith("multipart/form-data")) {
              return fetchRequest.formData();
            }

            return options.request.body();
          },
        },
      });
    },
  ],
  interceptors: [
    onError((error) => {
      logger.error({ err: error }, "RPC handler error");
    }),
    async ({ next }) => {
      try {
        return await next();
      } catch (error) {
        throw mapError(error);
      }
    },
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
