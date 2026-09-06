import type { Attributes } from "@opentelemetry/api";

import { logger } from "#/observability/logger/logger";
import { sanitizeRequestData } from "#/observability/request-context";
import { getActiveSpan } from "#/observability/tracing";

export type SpanFields = Record<string, string | number | boolean | null | undefined>;

type AddContextOptions = {
  log?: Record<string, unknown>;
  span?: SpanFields;
};

function toSpanAttributes(fields: SpanFields): Attributes {
  const clean = sanitizeRequestData(fields);
  const attributes: Attributes = {};
  for (const [key, value] of Object.entries(clean)) {
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      attributes[key] = value;
    }
  }
  return attributes;
}

export function addContext(options: AddContextOptions, message = "Context attached"): void {
  if (options.span) {
    const span = getActiveSpan();
    if (span) {
      span.setAttributes(toSpanAttributes(options.span));
    }
  }
  if (options.log) {
    logger.info(sanitizeRequestData(options.log), message);
  }
}
