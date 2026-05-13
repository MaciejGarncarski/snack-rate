import pino from "pino";

import { observabilityConfig } from "#/observability/config";

// Need to use "manual" env check to avoid importing "pino-pretty" in production, which causes issues with bundlers
export const pinoLogger =
  process.env.NODE_ENV === "production"
    ? pino({
        level: observabilityConfig.logLevel,
      })
    : pino({
        level: observabilityConfig.logLevel,
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      });
