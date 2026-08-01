import {
  metrics,
  type Counter,
  type Histogram,
  type Meter,
  type MetricOptions,
} from "@opentelemetry/api";

export const meter: Meter = metrics.getMeter("snack-rate", "0.1.0");

export function createCounter(name: string, options?: MetricOptions): Counter {
  return meter.createCounter(name, options);
}

export function createHistogram(name: string, options?: MetricOptions): Histogram {
  return meter.createHistogram(name, options);
}
