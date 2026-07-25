import { serverEnv } from "#/lib/server.env";
import { logger } from "#/observability/logger/logger";
import { initOpenTelemetry } from "#/observability/otel-sdk";

initOpenTelemetry({
  otelExporterOtlpEndpoint: serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT,
  observabilityTracingEnabled: serverEnv.OBSERVABILITY_TRACING_ENABLED,
  observabilityMetricsEnabled: serverEnv.OBSERVABILITY_METRICS_ENABLED,
  logger: {
    info: (msg) => logger.info({ endpoint: serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT }, msg),
    error: (msg) => logger.error({}, msg),
  },
});
