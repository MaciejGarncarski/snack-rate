import { SpanStatusCode } from "@opentelemetry/api";

import { logger } from "#/observability/logger/logger";
import { getTracer, startSpan } from "#/observability/tracing";

const tracer = getTracer("uncaught-errors");

function recordError(eventName: string, cause: unknown) {
  startSpan(
    eventName,
    (span) => {
      const message = String(cause);

      if (cause instanceof Error) {
        span.recordException(cause);
      } else {
        span.recordException({ message });
      }

      span.setStatus({ code: SpanStatusCode.ERROR, message });
    },
    { tracer },
  );
}

function handleFatal(eventName: string, message: string, cause: unknown) {
  logger.error({ cause }, message);
  recordError(eventName, cause);
  process.exit(1);
}

export function installUncaughtErrorHandlers() {
  process.on("uncaughtException", (reason) => {
    handleFatal("uncaughtException", "Uncaught Exception", reason);
  });

  process.on("unhandledRejection", (reason) => {
    handleFatal("unhandledRejection", "Unhandled Rejection", reason);
  });
}
