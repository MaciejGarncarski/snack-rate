import type { Attributes } from "@opentelemetry/api";
import { createMiddleware } from "@tanstack/react-start";

import { httpRequestsCounter, httpStatusCodesCounter } from "#/observability/counters";
import { httpDurationHistogram } from "#/observability/http-duration";
import { logger } from "#/observability/logger/logger";
import { getTracer, markSpanOk, recordSpanError, startActiveSpan } from "#/observability/tracing";

const SERVER_FN_PREFIX = "/_serverFn/";
const MAX_URL_LENGTH = 150;
const HEALTH_ROUTE_PREFIX = "/health";

function normalizeHttpRoute(pathname: string): string {
  if (!pathname.startsWith(SERVER_FN_PREFIX)) return pathname;
  try {
    const payloadBase64 = pathname
      .slice(SERVER_FN_PREFIX.length)
      .replaceAll("-", "+")
      .replaceAll("_", "/");
    const payload = JSON.parse(atob(payloadBase64));
    const exportName = payload.export.replace(/_createServerFn_handler$/u, "");
    return `/_serverFn/${exportName}`;
  } catch {
    return pathname;
  }
}

export const requestLoggerMiddleware = createMiddleware({ type: "request" }).server(
  ({ request, next }) => {
    const url = new URL(request.url);

    if (url.pathname.startsWith(HEALTH_ROUTE_PREFIX)) {
      return next();
    }

    httpRequestsCounter.add(1);
    const startTime = Date.now();
    const httpRoute = normalizeHttpRoute(url.pathname);

    const logUrl =
      request.url.length > MAX_URL_LENGTH
        ? request.url.slice(0, MAX_URL_LENGTH) + "..."
        : request.url;

    return startActiveSpan(
      `${request.method} ${url.pathname}`,
      async (span) => {
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
          markSpanOk(span);

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
          recordSpanError(span, err);

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
          const attributes: Attributes = {
            "http.method": request.method,
            "http.route": httpRoute,
          };
          if (statusCode !== undefined) {
            attributes["http.status_code"] = statusCode;
          }
          httpDurationHistogram.record(Date.now() - startTime, attributes);
        }
      },
      { tracer: getTracer("app") },
    );
  },
);
