import { pinoLogger } from "#/lib/logger/pino";

class LoggerFacade {
  info(meta: object, message?: string, ...args: any[]) {
    pinoLogger.info(meta, message, ...args);
  }
  error(meta: object, message?: string, ...args: any[]) {
    pinoLogger.error(meta, message, ...args);
  }
  debug(meta: object, message?: string, ...args: any[]) {
    pinoLogger.debug(meta, message, ...args);
  }
  warn(meta: object, message?: string, ...args: any[]) {
    pinoLogger.warn(meta, message, ...args);
  }
}

export const logger = new LoggerFacade();
