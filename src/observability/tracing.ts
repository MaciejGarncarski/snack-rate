import { trace } from "@opentelemetry/api";

export function getTraceContext() {
  const span = trace.getActiveSpan();
  const ctx = span?.spanContext();

  return {
    traceId: ctx?.traceId,
    spanId: ctx?.spanId,
  };
}

export function getActiveTraceId() {
  return getTraceContext().traceId;
}

export function getActiveSpanId() {
  return getTraceContext().spanId;
}
