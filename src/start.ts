import { logger } from "#/lib/logger/logger";
import { httpDuration } from "#/lib/metrics/http-duration";
import { createMiddleware, createStart } from "@tanstack/react-start";
export const requestLogger = createMiddleware({ type: "request" }).server(
  async ({ request, next }) => {
    const endTimer = httpDuration.startTimer();
    const route = new URL(request.url).pathname;

    try {
      const res = await next();
      const status = String(res.response.status);

      endTimer({
        method: request.method,
        route,
        status,
      });

      logger.info(
        {
          method: request.method,
          url: request.url,
          status,
        },
        "Request completed",
      );

      return res;
    } catch (err) {
      const status = "500";

      endTimer({
        method: request.method,
        route,
        status,
      });

      logger.error(
        {
          method: request.method,
          url: request.url,
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
