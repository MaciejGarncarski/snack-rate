import pino from "pino";

import { env } from "#/env/env";
import { observabilityConfig } from "#/observability/config";

export const pinoLogger = env.isProduction
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
