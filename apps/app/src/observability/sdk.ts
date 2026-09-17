import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/opentelemetry";
import ms from "ms";

import { serverEnv } from "#/lib/server.env";
import { installUncaughtErrorHandlers } from "#/observability/errors";
import { logger } from "#/observability/logger/logger";
import { OTEL_SERVICE_NAME, OTEL_SERVICE_VERSION } from "#/observability/service";

function resolveTraceExporterUrl(endpoint: string | undefined) {
  if (!endpoint) return;
  const url = new URL(endpoint);
  if (url.pathname === "/") {
    url.pathname = "/v1/traces";
  }
  return url.toString();
}

// SAFETY: a module-level flag on globalThis prevents double SDK init across hot reloads.
const sdkStartedGlobal = globalThis as {
  __OTEL_SDK_STARTED__?: boolean;
  __OTEL_SHUTDOWN_INSTALLED__?: boolean;
  __OTEL_SDK__?: { shutdown: () => Promise<void> };
};

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
            timeoutMillis: ms("10s"),
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
      [ATTR_SERVICE_NAME]: OTEL_SERVICE_NAME,
      [ATTR_SERVICE_VERSION]: OTEL_SERVICE_VERSION,
    }),
    instrumentations: [
      new ORPCInstrumentation(),
      getNodeAutoInstrumentations({
        "@opentelemetry/instrumentation-pg": {
          enabled: true,
        },
        "@opentelemetry/instrumentation-dns": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-fs": {
          enabled: false,
        },
        "@opentelemetry/instrumentation-net": {
          enabled: false,
        },
      }),
    ],
  });

  sdkStartedGlobal.__OTEL_SDK__ = sdk;
  installShutdownHook();

  sdk.start();
  logger.info({}, "OpenTelemetry SDK started");

  installUncaughtErrorHandlers();
}

function installShutdownHook() {
  if (sdkStartedGlobal.__OTEL_SHUTDOWN_INSTALLED__) {
    return;
  }
  sdkStartedGlobal.__OTEL_SHUTDOWN_INSTALLED__ = true;

  const shutdown = async (signal: string) => {
    try {
      await sdkStartedGlobal.__OTEL_SDK__?.shutdown();
      logger.info({ signal }, "OpenTelemetry SDK shut down");
    } catch (error) {
      logger.error({ error, signal }, "Error shutting down OpenTelemetry SDK");
    }
  };

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}
