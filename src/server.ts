import handler from "@tanstack/react-start/server-entry";

import "#/observability/instrumentation";
import { runPreStartChecks } from "#/observability/readiness/pre-start";
await runPreStartChecks();

export default {
  fetch(request: Request) {
    return handler.fetch(request);
  },
};
