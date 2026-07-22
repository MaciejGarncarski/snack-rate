import pRetry, { type RetryContext } from "p-retry";

import type { LoggerAdapter } from "#/observability/logger/logger";

type Options = {
  retries: number;
  minTimeout: number;
  factor: number;
  maxTimeout?: number;
  fnName?: string;
  logger?: LoggerAdapter;
};

export function exponentialBackoff<T>(
  fn: () => Promise<T>,
  { retries, minTimeout, factor, maxTimeout = Infinity, logger, fnName }: Options,
): Promise<T> {
  return pRetry(fn, {
    retries,
    minTimeout,
    factor,
    maxTimeout,

    onFailedAttempt: (context: RetryContext) => {
      logger?.warn(
        {
          error: context.error,
          attempt: context.attemptNumber,
          retriesLeft: context.retriesLeft,
          retryDelay: context.retryDelay,
        },
        `Retrying operation (exponential backoff), ${fnName} failed`,
      );
    },
  });
}
