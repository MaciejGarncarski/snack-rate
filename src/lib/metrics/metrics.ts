// oxlint-disable no-underscore-dangle
import { Registry, collectDefaultMetrics, Counter } from "prom-client";

type MetricsGlobal = typeof globalThis & {
  __metrics_registry__?: Registry;
  __metrics_collected__?: boolean;
};

const metricsGlobal = globalThis as MetricsGlobal;

export const register = metricsGlobal.__metrics_registry__ || new Registry();

metricsGlobal.__metrics_registry__ = register;

if (!metricsGlobal.__metrics_collected__) {
  collectDefaultMetrics({ register });
  metricsGlobal.__metrics_collected__ = true;
}

export const readinessFailureCounter =
  (metricsGlobal as any).__readiness_failure_counter__ ||
  new Counter({
    name: "readiness_failure_total",
    help: "Number of readiness failures",
    registers: [register],
  });

(metricsGlobal as any).__readiness_failure_counter__ = readinessFailureCounter;
