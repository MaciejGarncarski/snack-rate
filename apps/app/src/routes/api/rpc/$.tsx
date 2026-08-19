import { TmpFileUploadHandlerPlugin } from "@orpc/node";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSHandlerPlugin } from "@orpc/server/plugins";
import { createFileRoute } from "@tanstack/react-router";

import { MAX_FILE_SIZE } from "#/const/image-const";
import { logger } from "#/observability/logger/logger";
import { getActiveSpan } from "#/observability/tracing";
import { mapError } from "#/orpc/map-error";
import router from "#/orpc/router";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");
const MAX_BODY_SIZE_EXCLUDING_FILE = 3 * 1024 * 1024;

const corsPlugin = new CORSHandlerPlugin({
  allowHeaders: ["Content-Disposition", "Standard-Server"],
  exposeHeaders: ["Content-Disposition", "Standard-Server"],
});

const tmpFilePlugin = new TmpFileUploadHandlerPlugin({
  maxBodySize: {
    file: MAX_FILE_SIZE,
    memory: MAX_BODY_SIZE_EXCLUDING_FILE,
    stream: Number.POSITIVE_INFINITY,
  },
});

const handler = new RPCHandler(router, {
  plugins: [corsPlugin, tmpFilePlugin],
  fetchInterceptors: [
    (options) => {
      return options.next({
        ...options,
        context: {
          ...options.context,
          // SAFETY: the symbol-keyed value is an OverrideBodyContext, read back in the routing interceptor below.
          // oxlint-disable-next-line typescript/no-explicit-any
          [OVERRIDE_BODY_CONTEXT as any]: {
            fetchRequest: options.request,
          },
        },
      });
    },
  ],
  interceptors: [
    async ({ request, next }) => {
      const span = getActiveSpan();

      request.signal?.addEventListener("abort", () => {
        span?.addEvent("aborted", { reason: String(request.signal?.reason) });
      });

      try {
        return await next();
      } catch (error) {
        // SAFETY: RPC handlers throw Error instances; only their cause is read off the narrowed error.
        logger.error({ err: error, cause: (error as Error).cause }, "RPC handler error");
        throw mapError(error);
      }
    },
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api/rpc",
    context: { requestHeaders: request.headers, guestId: null, userId: null },
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
