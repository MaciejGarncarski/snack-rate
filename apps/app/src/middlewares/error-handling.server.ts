import { createMiddleware } from "@tanstack/react-start";

import { logger } from "#/observability/logger/logger";
import { mapError } from "#/orpc/map-error";

export const errorHandlingMiddleware = createMiddleware({ type: "function" }).server(
  async ({ next }) => {
    try {
      return await next();
    } catch (error) {
      // SAFETY: handlers throw Error instances; only their cause is read off the narrowed error.
      logger.error({ err: error, cause: (error as Error).cause }, "RPC handler error");
      throw mapError(error);
    }
  },
);
