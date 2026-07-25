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
    pinoLogger.child({ logType: "app" }).info(withTrace(meta), message, ...args);
  }
  error(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).error(withTrace(meta), message, ...args);
  }
  debug(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).debug(withTrace(meta), message, ...args);
  }
  warn(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).warn(withTrace(meta), message, ...args);
  }
  audit(meta: object, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "audit" }).info(withTrace(meta), message, ...args);
  }
}

export const logger = new LoggerAdapter();
