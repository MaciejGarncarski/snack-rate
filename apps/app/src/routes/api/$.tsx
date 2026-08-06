// oxlint-disable-next-line import/no-unassigned-import
import "#/polyfill";
import { SmartCoercionPlugin } from "@orpc/json-schema";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { createFileRoute } from "@tanstack/react-router";

import { logger } from "#/observability/logger/logger";
import { getActiveTraceId } from "#/observability/tracing";
import router from "#/orpc/router";

const handler = new OpenAPIHandler(router, {
  interceptors: [
    onError((error) => {
      logger.error({ err: error }, "API handler error");
    }),
  ],
  plugins: [
    new SmartCoercionPlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
      specGenerateOptions: {
        info: {
          title: "Snack Rate API",
          version: "0.0.1",
        },
        commonSchemas: {
          UndefinedError: { error: "UndefinedError" },
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
      docsProvider: "scalar",
      docsPath: "/docs",
      docsTitle: "Snack Rate API Reference",
      docsConfig: {
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
    context: {},
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
