import { env } from "#/env/env";
import pino from "pino";

export const pinoLogger =
  env.isProduction
    ? pino({
        level: "info",
      })
    : pino({
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      });
