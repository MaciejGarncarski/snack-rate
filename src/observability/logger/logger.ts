import { pinoLogger } from "#/observability/logger/pino";
import { getTraceContext } from "#/observability/tracing";

const enableTracing = process.env.OBSERVABILITY_TRACING_ENABLED !== "false";

function withTrace(meta: object) {
  if (!enableTracing) return meta;
  const { traceId, spanId } = getTraceContext();
  return { ...meta, traceId, spanId };
}

export class LoggerAdapter {
  info(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.info(withTrace(meta), message, ...args);
  }
  error(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.error(withTrace(meta), message, ...args);
  }
  debug(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.debug(withTrace(meta), message, ...args);
  }
  warn(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.warn(withTrace(meta), message, ...args);
  }
}

export const logger = new LoggerAdapter();
