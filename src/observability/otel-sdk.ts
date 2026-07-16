import { SpanStatusCode, trace } from "@opentelemetry/api";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";
import { ORPCInstrumentation } from "@orpc/otel";

export interface OtelSdkOptions {
  otelExporterOtlpEndpoint?: string;
  observabilityTracingEnabled?: string;
  observabilityMetricsEnabled?: string;
  logger?: { info: (msg: string) => void; error: (msg: string) => void };
}

const tracer = trace.getTracer("uncaught-errors");

function recordError(eventName: string, reason: unknown) {
  const span = tracer.startSpan(eventName);
  const message = String(reason);

  if (reason instanceof Error) {
    span.recordException(reason);
  } else {
    span.recordException({ message });
  }

  span.setStatus({ code: SpanStatusCode.ERROR, message });
  span.end();
}

export function initOpenTelemetry(options: OtelSdkOptions = {}) {
  if ((globalThis as any).__OTEL_SDK_STARTED__) {
    return;
  }

  (globalThis as any).__OTEL_SDK_STARTED__ = true;

  const log = options.logger ?? console;
  const enableTracing = (options.observabilityTracingEnabled ?? "true") !== "false";
  const enableMetrics = (options.observabilityMetricsEnabled ?? "true") !== "false";
  const otelEndpoint = options.otelExporterOtlpEndpoint;

  const traceExporterUrl = otelEndpoint
    ? (() => {
        const url = new URL(otelEndpoint);
        if (url.pathname === "/") {
          url.pathname = "/v1/traces";
        }
        return url.toString();
      })()
    : undefined;

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
              log.error("Error occurred while starting Prometheus metrics server");
            } else {
              log.info("Prometheus metrics server is running");
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
          enabled: true,
        },
      }),
    ],
  });

  sdk.start();
  log.info("OpenTelemetry SDK started");

  process.on("uncaughtException", (reason) => {
    recordError("uncaughtException", reason);
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    recordError("unhandledRejection", reason);
    process.exit(1);
  });
}
