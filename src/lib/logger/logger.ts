import { pinoLogger } from "#/lib/logger/pino";
import { httpLogger } from "#/lib/logger/http";

class LoggerFacade {
  info(msg: string, meta?: object) {
    pinoLogger.info(meta || {}, msg);
  }

  error(msg: string, err?: unknown) {
    pinoLogger.error({ err }, msg);
  }

  warn(msg: string, meta?: object) {
    pinoLogger.warn(meta || {}, msg);
  }

  debug(msg: string, meta?: object) {
    pinoLogger.debug(meta || {}, msg);
  }

  http() {
    return httpLogger;
  }
}

export const logger = new LoggerFacade();
