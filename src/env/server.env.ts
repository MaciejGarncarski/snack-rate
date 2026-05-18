import * as z from "zod";

const schema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(1),
  POSTGRES_DB: z.string().min(1),
  DATABASE_URL: z.url(),
  OTEL_EXPORTER_OTLP_ENDPOINT: z.url(),

  OBSERVABILITY_LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("info"),
  OBSERVABILITY_METRICS_ENABLED: z.enum(["true", "false"]).default("true"),
  OBSERVABILITY_TRACING_ENABLED: z.enum(["true", "false"]).default("true"),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("Invalid server environment variables:");
  console.error(z.prettifyError(parsed.error));
  process.exit(1);
}

export const serverEnv = {
  ...parsed.data,
  isProd: parsed.data.NODE_ENV === "production",
  isDev: parsed.data.NODE_ENV === "development",
  isTest: parsed.data.NODE_ENV === "test",
};
