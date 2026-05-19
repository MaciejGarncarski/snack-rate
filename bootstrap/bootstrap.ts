// oxlint-disable import/no-unassigned-import
import "./instrumentation.ts";
import { SpanStatusCode, trace } from "@opentelemetry/api";

const tracer = trace.getTracer("uncaught-errors");

function recordError(eventName: string, reason: unknown) {
  const span = tracer.startSpan(eventName);
  const message = String(reason);

  if (reason instanceof Error) {
    span.recordException(reason);
  } else {
    span.recordException({ message });
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message });
  span.end();
}

process.on("uncaughtException", (reason) => {
  recordError("uncaughtException", reason);
  process.exit(1);
});

process.on("unhandledRejection", (reason) => {
  recordError("unhandledRejection", reason);
  process.exit(1);
});
