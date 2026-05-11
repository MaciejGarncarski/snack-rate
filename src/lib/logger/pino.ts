import pino from "pino";

export const pinoLogger =
  process.env.NODE_ENV === "production"
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
