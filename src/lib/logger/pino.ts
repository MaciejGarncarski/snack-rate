import pino from "pino";

const transport = pino.transport({
  target: "pino-roll",
  options: {
    file: "log-files/file",
    frequency: "daily",
    dateFormat: "yyyy.MM.dd",
    mkdir: true,
  },
});

export const pinoLogger =
  // process.env.NODE_ENV === "production"
  //   ? pino(transport) :
  pino({
    level: process.env.NODE_ENV === "production" ? "info" : "debug",
  });
