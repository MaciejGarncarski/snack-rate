import { type Attributes, type Span, SpanStatusCode, trace, type Tracer } from "@opentelemetry/api";

export function getTracer(name = "snack-rate"): Tracer {
  return trace.getTracer(name);
}

export function getActiveSpan() {
  return trace.getActiveSpan();
}

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

export function markSpanOk(span: Span) {
  span.setStatus({ code: SpanStatusCode.OK });
}

export function recordSpanError(span: Span, error: unknown) {
  span.recordException(error as Error);
  span.setStatus({ code: SpanStatusCode.ERROR });
}

type SpanOptions = {
  attributes?: Attributes;
  tracer?: Tracer;
};

function runSpan<T>(span: Span, fn: (span: Span) => T | Promise<T>): Promise<T> {
  return Promise.resolve(fn(span))
    .catch((err) => {
      recordSpanError(span, err);
      throw err;
    })
    .finally(() => {
      span.end();
    });
}

export function startSpan<T>(
  name: string,
  fn: (span: Span) => T | Promise<T>,
  options: SpanOptions = {},
): Promise<T> {
  const tracer = options.tracer ?? getTracer();
  const span = tracer.startSpan(
    name,
    options.attributes ? { attributes: options.attributes } : undefined,
  );
  return runSpan(span, fn);
}

export function startActiveSpan<T>(
  name: string,
  fn: (span: Span) => T | Promise<T>,
  options: SpanOptions = {},
): Promise<T> {
  const tracer = options.tracer ?? getTracer();

  return tracer.startActiveSpan(name, (span) => {
    if (options.attributes) {
      span.setAttributes(options.attributes);
    }
    return runSpan(span, fn);
  });
}
