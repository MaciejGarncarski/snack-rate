// oxlint-disable no-console
import { initOpenTelemetry } from "../../src/observability/otel-sdk";

export default function () {
  console.log("==== Initializing OpenTelemetry ====");

  initOpenTelemetry({
    otelExporterOtlpEndpoint: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
    observabilityTracingEnabled: process.env.OBSERVABILITY_TRACING_ENABLED,
    observabilityMetricsEnabled: process.env.OBSERVABILITY_METRICS_ENABLED,
  });

  console.log("==== OpenTelemetry initialized ====");
}
