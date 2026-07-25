import { metrics } from "@opentelemetry/api";

export const meter = metrics.getMeter("api", "0.1.0");
