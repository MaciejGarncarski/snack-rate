import { SpanStatusCode, trace } from "@opentelemetry/api";
import { createMiddleware } from "@tanstack/react-start";

import { httpRequestsCounter, httpStatusCodesCounter } from "#/observability/counters";
import { httpDurationHistogram } from "#/observability/http-duration";
import { logger } from "#/observability/logger/logger";

const tracer = trace.getTracer("tanstack-start-app");

export const requestLoggerMiddleware = createMiddleware({ type: "request" }).server(
  ({ request, next }) => {
    httpRequestsCounter.add(1);
    const startTime = Date.now();
    const url = new URL(request.url);

    return tracer.startActiveSpan(`${request.method} ${url.pathname}`, async (span) => {
      let statusCode: number | undefined;
      span.setAttributes({
        "http.method": request.method,
        "http.url": request.url,
        "http.route": url.pathname,
      });

      try {
        const res = await next();
        statusCode = res.response.status;
        const status = String(statusCode);

        httpStatusCodesCounter.add(1, { "http.status_code": statusCode });
        span.setAttribute("http.status_code", statusCode);
        span.setStatus({ code: SpanStatusCode.OK });

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
        span.recordException(err as Error);
        span.setStatus({ code: SpanStatusCode.ERROR });

        logger.error(
          {
            method: request.method,
            url: request.url,
            error: err,
          },
          "Request failed",
        );

        throw err;
      } finally {
        httpDurationHistogram.record(Date.now() - startTime, {
          "http.method": request.method,
          "http.route": url.pathname,
          ...(statusCode === undefined ? {} : { "http.status_code": statusCode }),
        });
        span.end();
      }
    });
  },
);
