import { serverEnv } from "#/lib/server.env";
import { initOpenTelemetry } from "#/observability/otel-sdk";

initOpenTelemetry({
  otelExporterOtlpEndpoint: serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT,
  observabilityTracingEnabled: serverEnv.OBSERVABILITY_TRACING_ENABLED,
  observabilityMetricsEnabled: serverEnv.OBSERVABILITY_METRICS_ENABLED,
  logger: {
    // oxlint-disable-next-line no-console
    info: (msg) => console.log({ endpoint: serverEnv.OTEL_EXPORTER_OTLP_ENDPOINT }, msg),
    // oxlint-disable-next-line no-console
    error: (msg) => console.log({}, msg),
  },
});
