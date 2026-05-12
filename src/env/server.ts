import { createServerEnv } from "#/env/server-parser";

export { type ServerEnv } from "#/env/server-parser";

export const serverEnv = Object.freeze(
  createServerEnv({
    isServerRuntime: Boolean(import.meta.env.SSR),
    source: process.env,
  }),
);
