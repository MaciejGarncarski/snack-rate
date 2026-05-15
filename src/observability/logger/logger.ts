import { pinoLogger } from "#/observability/logger/pino";
import { getTraceContext } from "#/observability/tracing";

const enableTracing = process.env.OBSERVABILITY_TRACING_ENABLED !== "false";

function withTrace(meta: object) {
  if (!enableTracing) return meta;
  const { traceId, spanId } = getTraceContext();
  return { ...meta, traceId, spanId };
}

class LoggerFacade {
  info(meta: object, message?: string, ...args: any[]) {
    pinoLogger.info(withTrace(meta), message, ...args);
  }
  error(meta: object, message?: string, ...args: any[]) {
    pinoLogger.error(withTrace(meta), message, ...args);
  }
  debug(meta: object, message?: string, ...args: any[]) {
    pinoLogger.debug(withTrace(meta), message, ...args);
  }
  warn(meta: object, message?: string, ...args: any[]) {
    pinoLogger.warn(withTrace(meta), message, ...args);
  }
}

export const logger = new LoggerFacade();
