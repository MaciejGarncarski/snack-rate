// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { SmartCoercionHandlerPlugin } from "@orpc/json-schema";
import { OpenAPIGenerator } from "@orpc/openapi";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferenceHandlerPlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod";
import { createFileRoute } from "@tanstack/react-router";

import { logger } from "#/observability/logger/logger";
import { getActiveTraceId } from "#/observability/tracing";
import router from "#/orpc/router";

const openAPIGenerator = new OpenAPIGenerator({
  converters: [new ZodToJsonSchemaConverter()],
});

const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      logger.error({ err: error }, "API handler error");
    }),
  ],
  plugins: [
    new SmartCoercionHandlerPlugin({
      converters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferenceHandlerPlugin({
      spec: () =>
        openAPIGenerator.generate(router, {
          base: {
            info: {
              title: "Snack Rate API",
              version: "0.0.1",
            },
            security: [{ bearerAuth: [] }],
            components: {
              securitySchemes: {
                bearerAuth: {
                  type: "http",
                  scheme: "bearer",
                },
              },
            },
          },
        }),
      provider: "scalar",
      docsPath: "/docs",
      docsTitle: "Snack Rate API Reference",
      providerConfig: {
        authentication: {
          securitySchemes: {
            bearerAuth: {
              token: "default-token",
            },
          },
        },
      },
    }),
  ],
});

async function handle({ request }: { request: Request }) {
  const { response } = await handler.handle(request, {
    prefix: "/api",
    context: { requestHeaders: request.headers, guestId: null, userId: null },
  });

  const traceId = getActiveTraceId();

  if (response) {
    // Add traceId to response headers
    response.headers.set("x-trace-id", traceId || "unknown");
    return response;
  }

  return new Response("Not Found", { status: 404 });
}

export const Route = createFileRoute("/api/$")({
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
