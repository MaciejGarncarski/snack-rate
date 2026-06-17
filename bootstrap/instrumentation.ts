// oxlint-disable no-console
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/otel";

const enableTracing = process.env.OBSERVABILITY_TRACING_ENABLED !== "false";
const enableMetrics = process.env.OBSERVABILITY_METRICS_ENABLED !== "false";
const traceExporterUrl = createTraceExporterUrl(process.env.OTEL_EXPORTER_OTLP_ENDPOINT!);

const traceExporter = enableTracing
  ? new OTLPTraceExporter({
      url: traceExporterUrl,
      timeoutMillis: 10000,
      concurrencyLimit: 10,
    })
  : undefined;

const metricReader = enableMetrics
  ? new PrometheusExporter(
      {
        port: 9464,
        endpoint: "/metrics",
        host: "0.0.0.0",
      },
      (error) => {
        if (error) {
          console.log({ port: 9464 }, "Error occurred while starting Prometheus metrics server");
        } else {
          console.log({ port: 9464 }, "Prometheus metrics server is running");
        }
      },
    )
  : undefined;

const otelSdk = new NodeSDK({
  traceExporter,
  metricReader,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "tanstack-start-app",
    [ATTR_SERVICE_VERSION]: "0.1.0",
  }),
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pg": {
        enabled: true,
      },
    }),
    new ORPCInstrumentation(),
  ],
});

await otelSdk.start();

console.log({ endpoint: traceExporterUrl }, "OpenTelemetry SDK started");

function createTraceExporterUrl(endpoint: string) {
  console.log({ endpoint }, process.env.OTEL_EXPORTER_OTLP_ENDPOINT);
  const url = new URL(endpoint);

  if (url.pathname === "/") {
    url.pathname = "/v1/traces";
  }

  return url.toString();
}
