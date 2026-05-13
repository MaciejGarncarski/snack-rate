import { env } from "#/env/env";

const observabilityConfigData = {
  development: {
    logLevel: "debug",
    enableTracing: true,
    enableMetrics: false,
  },
  production: {
    logLevel: "warn",
    enableTracing: true,
    enableMetrics: true,
  },
  test: {
    logLevel: "error",
    enableTracing: false,
    enableMetrics: false,
  },
} as const;

export const observabilityConfig = observabilityConfigData[env.client.NODE_ENV];

console.log("Observability configuration:", observabilityConfig);
