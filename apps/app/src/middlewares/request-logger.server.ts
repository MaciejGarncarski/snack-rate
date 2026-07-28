import { SpanStatusCode, trace } from "@opentelemetry/api";
import { createMiddleware } from "@tanstack/react-start";

import { httpRequestsCounter, httpStatusCodesCounter } from "#/observability/counters";
import { httpDurationHistogram } from "#/observability/http-duration";
import { logger } from "#/observability/logger/logger";

const tracer = trace.getTracer("app");

const SERVER_FN_PREFIX = "/_serverFn/";
const MAX_URL_LENGTH = 150;

function normalizeHttpRoute(pathname: string): string {
  if (!pathname.startsWith(SERVER_FN_PREFIX)) return pathname;
  try {
    const payloadBase64 = pathname
      .slice(SERVER_FN_PREFIX.length)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const payload = JSON.parse(atob(payloadBase64));
    const exportName = payload.export.replace(/_createServerFn_handler$/, "");
    return `/_serverFn/${exportName}`;
  } catch {
    return pathname;
  }
}

export const requestLoggerMiddleware = createMiddleware({ type: "request" }).server(
  ({ request, next }) => {
    httpRequestsCounter.add(1);
    const startTime = Date.now();
    const url = new URL(request.url);
    const httpRoute = normalizeHttpRoute(url.pathname);

    const logUrl =
      request.url.length > MAX_URL_LENGTH
        ? request.url.slice(0, MAX_URL_LENGTH) + "..."
        : request.url;

    return tracer.startActiveSpan(`${request.method} ${url.pathname}`, async (span) => {
      let statusCode: number | undefined;
      span.setAttributes({
        "http.method": request.method,
        "http.url": logUrl,
        "http.route": httpRoute,
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
            url: logUrl,
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

        return new Response(
          JSON.stringify({
            success: false,
            message: "Internal Server Error",
            traceId: span.spanContext().traceId,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          },
        );
      } finally {
        httpDurationHistogram.record(Date.now() - startTime, {
          "http.method": request.method,
          "http.route": httpRoute,
          ...(statusCode === undefined ? {} : { "http.status_code": statusCode }),
        });
        span.end();
      }
    });
  },
);
