import { meter } from "#/observability/metrics";

export const httpRequestsCounter = meter.createCounter("http_requests_total", {
  description: "Total HTTP requests",
});

export const httpStatusCodesCounter = meter.createCounter("http_status_codes_total", {
  description: "Total HTTP requests by status code",
});

export const readinessFailureCounter = meter.createCounter("readiness_failures_total", {
  description: "Total readiness failures",
});

export const dbFailuresCounter = meter.createCounter("db_failures_total", {
  description: "Total database failures",
});

export const testCounter = meter.createCounter("test_counter_total", {
  description: "A test counter for demonstration purposes",
});
