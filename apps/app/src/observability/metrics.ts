import {
  metrics,
  type Counter,
  type Histogram,
  type Meter,
  type MetricOptions,
} from "@opentelemetry/api";

import { OTEL_SERVICE_NAME, OTEL_SERVICE_VERSION } from "#/observability/service";

export const meter: Meter = metrics.getMeter(OTEL_SERVICE_NAME, OTEL_SERVICE_VERSION);

export function createCounter(name: string, options?: MetricOptions): Counter {
  return meter.createCounter(name, options);
}

export function createHistogram(name: string, options?: MetricOptions): Histogram {
  return meter.createHistogram(name, options);
}
