import type { Attributes } from "@opentelemetry/api";
import { createMiddleware } from "@tanstack/react-start";

import { httpRequestsCounter, httpStatusCodesCounter } from "#/observability/counters";
import { httpDurationHistogram } from "#/observability/http-duration";
import { logger } from "#/observability/logger/logger";
import { redactValue } from "#/observability/request-context";
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

function truncateUrl(value: string): string {
  return value.length > MAX_URL_LENGTH ? `${value.slice(0, MAX_URL_LENGTH)}...` : value;
}

function getQueryParams(url: URL): Record<string, unknown> | undefined {
  if (url.searchParams.size === 0) return undefined;
  const params: Record<string, unknown> = {};
  for (const [key, value] of url.searchParams) {
    params[key] = redactValue(value);
  }
  return params;
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
    const logUrl = truncateUrl(request.url);
    const query = getQueryParams(url);

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
              route: httpRoute,
              status,
              query,
            },
            "Request completed",
          );

          return res;
        } catch (err) {
          recordSpanError(span, err);

          logger.error(
            {
              method: request.method,
              url: logUrl,
              route: httpRoute,
              query,
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
