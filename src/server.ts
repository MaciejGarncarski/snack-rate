// This import is instrumentation for DEV SERVER!
// oxlint-disable-next-line import/no-unassigned-import
import "#/observability/instrumentation";
import handler from "@tanstack/react-start/server-entry";

import { runPreStartChecks } from "#/observability/readiness/pre-start";
import { startQueue } from "#/server/lib/queue.server";

await runPreStartChecks();
await startQueue();

export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
};
