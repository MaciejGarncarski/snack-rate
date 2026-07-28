import handler from "@tanstack/react-start/server-entry";
import { FastResponse } from "srvx";

import { runPreStartChecks } from "#/observability/readiness/pre-start";
import { startQueue } from "#/server/lib/queue.server";

globalThis.Response = FastResponse;
// from tanstack start docs
// its for 5% "free" speed up - node only

await runPreStartChecks();
await startQueue();

export default {
  fetch(request: Request) {
    return handler.fetch(request, {});
  },
};
