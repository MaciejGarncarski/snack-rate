import { serverEnv } from "@/lib/server.env";

const observabilityConfigData = {
  development: {
    logLevel: "debug",
    enableTracing: true,
    enableMetrics: true,
  },
  production: {
    logLevel: "info",
    enableTracing: true,
    enableMetrics: true,
  },
  test: {
    logLevel: "error",
    enableTracing: false,
    enableMetrics: false,
  },
} as const;

export const observabilityConfig = observabilityConfigData[serverEnv.NODE_ENV];
// oxlint-disable-next-line no-console
console.log("Observability configuration:", observabilityConfig, { nodeEnv: serverEnv.NODE_ENV });
