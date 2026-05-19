// This import is instrumentation for DEV SERVER!
// oxlint-disable-next-line import/no-unassigned-import
import "#/observability/instrumentation";
import handler from "@tanstack/react-start/server-entry";

import { runPreStartChecks } from "#/observability/readiness/pre-start";
await runPreStartChecks();

export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
};
