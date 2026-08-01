import { createHistogram } from "#/observability/metrics";

export const httpDurationHistogram = createHistogram("http_request_duration_ms", {
  description: "HTTP request duration",
  unit: "ms",
});
