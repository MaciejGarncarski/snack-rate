import { logger } from "#/lib/logger/logger";
import { createMiddleware, createStart } from "@tanstack/react-start";
export const requestLogger = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const start = Temporal.Now.instant().epochMilliseconds;

    try {
      const res = await next();

      const duration = Temporal.Now.instant().epochMilliseconds - start;

      logger.info(
        {
          method: request.method,
          url: request.url,
          status: res.response.status,
          duration: `${duration}ms`,
        },
        "Request completed",
      );

      return res;
    } catch (err) {
      const duration = Temporal.Now.instant().epochMilliseconds - start;

      logger.error(
        {
          method: request.method,
          url: request.url,
          duration: `${duration}ms`,
          error: err,
        },
        "Request failed",
      );

      throw err;
    }
  },
);
export const startInstance = createStart(() => ({
  requestMiddleware: [requestLogger],
}));
