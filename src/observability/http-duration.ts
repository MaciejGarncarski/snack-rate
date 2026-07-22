import { meter } from "@/observability/metrics";

export const httpDurationHistogram = meter.createHistogram("http_request_duration_ms", {
  description: "HTTP request duration",
  unit: "ms",
});
