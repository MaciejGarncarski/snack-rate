import pinoHttp from "pino-http";
import { pinoLogger } from "#/lib/logger/pino";

export const httpLogger = pinoHttp({
  logger: pinoLogger,
  customLogLevel: (req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
});
