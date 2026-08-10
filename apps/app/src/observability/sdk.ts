import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/opentelemetry";

import { serverEnv } from "#/lib/server.env";
import { installUncaughtErrorHandlers } from "#/observability/errors";
import { logger } from "#/observability/logger/logger";

function resolveTraceExporterUrl(endpoint: string | undefined) {
  if (!endpoint) return;
  const url = new URL(endpoint);
  if (url.pathname === "/") {
    url.pathname = "/v1/traces";
  }
  return url.toString();
}

const sdkStartedGlobal = globalThis as { __OTEL_SDK_STARTED__?: boolean };

export function initOpenTelemetry() {
  if (sdkStartedGlobal.__OTEL_SDK_STARTED__) {
    return;
  }

  sdkStartedGlobal.__OTEL_SDK_STARTED__ = true;

  const enableTracing = serverEnv.OBSERVABILITY_TRACING_ENABLED !== "false";
  const enableMetrics = serverEnv.OBSERVABILITY_METRICS_ENABLED !== "false";
  const traceExporterUrl = resolveTraceExporterUrl(serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT);

  const sdk = new NodeSDK({
    traceExporter:
      enableTracing && traceExporterUrl
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
          (error) => {
            if (error) {
              logger.error({ error }, "Error occurred while starting Prometheus metrics server");
            } else {
              logger.info({}, "Prometheus metrics server is running");
            }
          },
        )
      : undefined,
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "tanstack-start-app",
      [ATTR_SERVICE_VERSION]: "0.1.0",
    }),
    instrumentations: [
      new ORPCInstrumentation(),
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-pg": {
          enabled: true,
        },
      }),
    ],
  });

  sdk.start();
  logger.info({}, "OpenTelemetry SDK started");

  installUncaughtErrorHandlers();
}
