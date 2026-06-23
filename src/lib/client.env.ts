// oxlint-disable no-console
import { z } from "zod";

const schema = z.object({
  VITE_EXAMPLE_ENV_VAR: z.string().min(1),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error("Invalid client environment variables:");
  console.error(z.prettifyError(parsed.error));
  throw new Error("Invalid client environment variables");
}

export const clientEnv = {
  ...parsed.data,
  isProd: import.meta.env.NODE_ENV === "production",
  isDev: import.meta.env.NODE_ENV === "development",
  isTest: import.meta.env.NODE_ENV === "test",
};
