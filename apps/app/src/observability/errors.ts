import { SpanStatusCode } from "@opentelemetry/api";

import { logger } from "#/observability/logger/logger";
import { getTracer, startSpan } from "#/observability/tracing";

const tracer = getTracer("uncaught-errors");

function recordError(eventName: string, reason: unknown) {
  startSpan(
    eventName,
    (span) => {
      const message = String(reason);

      if (reason instanceof Error) {
        span.recordException(reason);
      } else {
        span.recordException({ message });
      }

      span.setStatus({ code: SpanStatusCode.ERROR, message });
    },
    { tracer },
  );
}

function handleFatal(eventName: string, message: string, reason: unknown) {
  logger.error({ reason }, message);
  recordError(eventName, reason);
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
