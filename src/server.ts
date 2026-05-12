import {
  createStartHandler,
  defaultStreamHandler,
  defineHandlerCallback,
} from "@tanstack/react-start/server";
import { createServerEntry } from "@tanstack/react-start/server-entry";

import { runPreStartChecks } from "#/lib/readiness/pre-start";

await runPreStartChecks();

const customHandler = defineHandlerCallback((ctx) => {
  return defaultStreamHandler(ctx);
});

const startHandler = createStartHandler(customHandler);

export default createServerEntry({
  fetch: startHandler,
});
