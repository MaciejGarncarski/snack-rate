// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { RPCHandler } from "@orpc/server/fetch";
import { CORSHandlerPlugin } from "@orpc/server/plugins";
import { parseFormData, type ParseFormDataOptions } from "@remix-run/form-data-parser";
import { createFileRoute } from "@tanstack/react-router";

import { MAX_FILE_SIZE, MAXIMUM_IMAGES } from "#/const/image-const";
import { logger } from "#/observability/logger/logger";
import { getActiveSpan } from "#/observability/tracing";
import { mapError } from "#/orpc/map-error";
import router from "#/orpc/router";
import { createFileUploadHandler } from "#/server/lib/automatic-file-upload-handler";

const OVERRIDE_BODY_CONTEXT = Symbol("OVERRIDE_BODY_CONTEXT");

type OverrideBodyContext = {
  fetchRequest: Request;
};

const parserConfig: ParseFormDataOptions = {
  maxFiles: MAXIMUM_IMAGES,
  maxFileSize: MAX_FILE_SIZE,
};

const corsPlugin = new CORSHandlerPlugin({
  allowHeaders: ["Content-Disposition", "Standard-Server"],
  exposeHeaders: ["Content-Disposition", "Standard-Server"],
});

const handler = new RPCHandler(router, {
  plugins: [corsPlugin],

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
  routingInterceptors: [
    (options) => {
      // SAFETY: context is arbitrary; we only ever write OVERRIDE_BODY_CONTEXT ourselves in the fetch interceptor above.
      // oxlint-disable-next-line typescript/no-explicit-any
      const context = options.context as any;
      // SAFETY: OVERRIDE_BODY_CONTEXT is only ever written as an OverrideBodyContext.
      const { fetchRequest } = context[OVERRIDE_BODY_CONTEXT] as OverrideBodyContext;

      if (!fetchRequest) {
        return options.next(options);
      }

      return options.next({
        ...options,
        request: {
          ...options.request,
          async resolveBody() {
            const contentType = fetchRequest.headers.get("content-type");

            if (contentType?.startsWith("multipart/form-data")) {
              const formData = await parseFormData(
                fetchRequest,
                parserConfig,
                createFileUploadHandler(),
              );

              return formData;
            }

            return options.request.resolveBody();
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
