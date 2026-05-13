import { metrics } from "@opentelemetry/api";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";

export const prometheusExporter = new PrometheusExporter({
  port: 9464,
  endpoint: "/metrics",
  host: "127.0.0.1",
});

export const meter = metrics.getMeter("api");
