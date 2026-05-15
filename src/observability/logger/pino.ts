import pino from "pino";

// Need to use "manual" env check to avoid importing "pino-pretty" in production, which causes issues with bundlers
export const pinoLogger =
  process.env.NODE_ENV === "production"
    ? pino({
        level: process.env.OBSERVABILITY_LOG_LEVEL || "info",
      })
    : pino({
        level: process.env.OBSERVABILITY_LOG_LEVEL || "info",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      });
