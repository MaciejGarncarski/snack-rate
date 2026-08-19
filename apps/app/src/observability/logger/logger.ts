import { pinoLogger } from "#/observability/logger/pino";
import { getTraceContext } from "#/observability/tracing";

const enableTracing = process.env.OBSERVABILITY_TRACING_ENABLED !== "false";

function withTrace<T extends object>(meta: T): object {
  if (!enableTracing) return meta;
  const { traceId, spanId } = getTraceContext();
  return Object.assign({}, meta, { traceId, spanId });
}

export class LoggerAdapter {
  info<T extends object>(meta: T, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).info(withTrace(meta), message, ...args);
  }
  error<T extends object>(meta: T, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).error(withTrace(meta), message, ...args);
  }
  debug<T extends object>(meta: T, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).debug(withTrace(meta), message, ...args);
  }
  warn<T extends object>(meta: T, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "app" }).warn(withTrace(meta), message, ...args);
  }
  audit<T extends object>(meta: T, message?: string, ...args: unknown[]) {
    pinoLogger.child({ logType: "audit" }).info(withTrace(meta), message, ...args);
  }
}

export const logger = new LoggerAdapter();
