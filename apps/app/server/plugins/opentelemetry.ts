// oxlint-disable no-console
import { definePlugin } from "nitro";

import { initOpenTelemetry } from "../../src/observability/sdk";

export default definePlugin(() => {
  console.log("==== Initializing OpenTelemetry ====");

  initOpenTelemetry();

  console.log("==== OpenTelemetry initialized ====");
});
