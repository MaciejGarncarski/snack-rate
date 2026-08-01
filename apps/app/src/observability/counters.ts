import { createCounter } from "#/observability/metrics";

export const httpRequestsCounter = createCounter("http_requests_total", {
  description: "Total HTTP requests",
});

export const httpStatusCodesCounter = createCounter("http_status_codes_total", {
  description: "Total HTTP requests by status code",
});

export const readinessFailureCounter = createCounter("readiness_failures_total", {
  description: "Total readiness failures",
});

export const dbFailuresCounter = createCounter("db_failures_total", {
  description: "Total database failures",
});

export const s3FailuresCounter = createCounter("s3_failures_total", {
  description: "Total S3 failures",
});

export const snacksCreatedCounter = createCounter("snacks_created_total", {
  description: "Total snacks created",
});

export const ratingsAddedCounter = createCounter("ratings_added_total", {
  description: "Total ratings added",
});

export const ratingsRemovedCounter = createCounter("ratings_removed_total", {
  description: "Total ratings removed",
});
