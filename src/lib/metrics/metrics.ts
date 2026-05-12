import { Registry, collectDefaultMetrics } from "prom-client";

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
