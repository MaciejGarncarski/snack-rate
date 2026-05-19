import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/otel";

import { serverEnv } from "#/env/server.env";
import { logger } from "#/observability/logger/logger";

function createTraceExporterUrl(endpoint: string) {
  const url = new URL(endpoint);

  if (url.pathname === "/") {
    url.pathname = "/v1/traces";
  }

  return url.toString();
}
const traceExporterUrl = createTraceExporterUrl(serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT);

const enableTracing = serverEnv.OBSERVABILITY_TRACING_ENABLED !== "false";
const enableMetrics = serverEnv.OBSERVABILITY_METRICS_ENABLED !== "false";

const otelSdk = new NodeSDK({
  traceExporter: enableTracing
    ? new OTLPTraceExporter({
        url: traceExporterUrl,
        timeoutMillis: 10000,
        concurrencyLimit: 10,
      })
    : undefined,

  metricReader: enableMetrics
    ? new PrometheusExporter(
        {
          port: 9464,
          endpoint: "/metrics",
          host: "0.0.0.0",
        },
        (error: unknown) => {
          if (error) {
            logger.error({ port: 9464 }, "Error occurred while starting Prometheus metrics server");
          } else {
            logger.info({ port: 9464 }, "Prometheus metrics server is running");
          }
        },
      )
    : undefined,
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "tanstack-start-app",
    [ATTR_SERVICE_VERSION]: "0.1.0",
  }),
  instrumentations: [
    new ORPCInstrumentation({
      enabled: true,
    }),
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pg": {
        enabled: false,
      },
    }),
  ],
});

await otelSdk.start();
logger.info({ endpoint: traceExporterUrl }, "OpenTelemetry SDK started");
