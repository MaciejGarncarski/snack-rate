import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

import { serverEnv } from "#/env/server.env";
import { observabilityConfig } from "#/observability/config";
import { logger } from "#/observability/logger/logger";
import { prometheusExporter } from "#/observability/metrics";

function createTraceExporterUrl(endpoint: string) {
  const url = new URL(endpoint);

  if (url.pathname === "/") {
    url.pathname = "/v1/traces";
  }

  return url.toString();
}

const traceExporterUrl = createTraceExporterUrl(serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT);

const exporter = new OTLPTraceExporter({
  url: traceExporterUrl,
  timeoutMillis: 10000,
  concurrencyLimit: 10,
});

const resource = resourceFromAttributes({
  [ATTR_SERVICE_NAME]: "tanstack-start-app",
  [ATTR_SERVICE_VERSION]: "0.1.0",
});

const otelSdk = new NodeSDK({
  traceExporter: observabilityConfig.enableTracing ? exporter : undefined,
  metricReader: observabilityConfig.enableMetrics ? prometheusExporter : undefined,
  resource: resource,
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-pg": {
        enabled: false,
      },
    }),
  ],
});

try {
  await otelSdk.start();
  logger.info({ endpoint: traceExporterUrl }, "OpenTelemetry SDK started");
} catch (error: unknown) {
  logger.warn({ error, endpoint: traceExporterUrl }, "OpenTelemetry SDK failed to start");
}
