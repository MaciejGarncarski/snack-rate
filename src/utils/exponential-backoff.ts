import pRetry, { type RetryContext } from "p-retry";

type Options = {
  retries: number;
  minTimeout: number;
  factor: number;
  maxTimeout?: number;
  fnName?: string;
  logger?: {
    warn: (obj: any, msg: string) => void;
  };
};

export async function exponentialBackoff<T>(
  fn: () => Promise<T>,
  { retries, minTimeout, factor, maxTimeout = Infinity, logger, fnName }: Options,
): Promise<T> {
  return pRetry(fn, {
    retries,
    minTimeout,
    factor,
    maxTimeout,

    onFailedAttempt: async (context: RetryContext) => {
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
