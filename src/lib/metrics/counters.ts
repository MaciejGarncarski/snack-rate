import { Counter } from "prom-client";

import { register } from "#/lib/metrics/metrics";

export const testCounter = new Counter({
  name: "app_login_attempts_total",
  help: "Total number of login attempts",
  labelNames: ["status", "user_id"],
  registers: [register],
});
