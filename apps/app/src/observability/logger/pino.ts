import pino from "pino";

// pnpm pipes development output, so enable pretty logging independently of TTY detection.
export const pinoLogger =
  process.env.NODE_ENV === "production"
    ? pino({
        level: process.env.OBSERVABILITY_LOG_LEVEL || "info",
      })
    : pino(
        { level: process.env.OBSERVABILITY_LOG_LEVEL || "info" },
        (await import("pino-pretty")).default({
          colorize: true,
          translateTime: "SYS:standard",
        }),
      );
