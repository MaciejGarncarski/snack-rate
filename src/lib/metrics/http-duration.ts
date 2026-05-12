import { register } from "#/lib/metrics/metrics";
import { Histogram } from "prom-client";

export const httpDuration = new Histogram({
  name: "http_request_duration_seconds",
  help: "HTTP request duration",
  labelNames: ["method", "route", "status"],
  registers: [register],
  buckets: [0.05, 0.1, 0.3, 0.5, 1, 2, 5],
});
