import * as z from "zod";

import { parseEnv } from "#/env/parse";

export const clientEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  VITE_API_URL: z.string().optional(),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;
type ClientEnvInput = z.input<typeof clientEnvSchema>;

export function parseClientEnv(source: ClientEnvInput): ClientEnv {
  return parseEnv(clientEnvSchema, source, "client");
}

export const clientEnv = Object.freeze(
  parseClientEnv({
    NODE_ENV: import.meta.env.NODE_ENV,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  }),
);
