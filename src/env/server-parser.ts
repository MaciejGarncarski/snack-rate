import * as z from "zod";

import { parseEnv } from "#/env/parse";

const portSchema = z.coerce.number().int().min(1024).max(65535).default(3000);

export const serverEnvSchema = z.object({
  PORT: portSchema,
  DATABASE_URL: z.string(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;
type ServerEnvInput = z.input<typeof serverEnvSchema>;
type SourceInput = NodeJS.ProcessEnv | ServerEnvInput;

export function parseServerEnv(source: SourceInput): ServerEnv {
  return parseEnv(serverEnvSchema, source, "server");
}

const clientGuard = new Proxy({} as ServerEnv, {
  get() {
    throw new Error("serverEnv cannot be accessed on the client");
  },
});

export function createServerEnv({
  isServerRuntime,
  source,
}: {
  isServerRuntime: boolean;
  source: SourceInput;
}): ServerEnv {
  if (!isServerRuntime) {
    return clientGuard;
  }

  return parseServerEnv(source);
}
