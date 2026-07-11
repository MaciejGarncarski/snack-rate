// oxlint-disable no-console
import * as z from "zod";

const schema = z.object({
  APP_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
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

  S3_ACCESS_KEY: z.string().min(1),
  S3_ENDPOINT: z.url(),
  S3_ENDPOINT_INTERNAL: z.url(),
  S3_REGION: z.string().min(1),
  S3_SECRET_KEY: z.string().min(1),
  S3_BUCKET_PUBLIC: z.string().min(1),
});

let _data: z.infer<typeof schema> | undefined;

function ensureParsed(): z.infer<typeof schema> {
  if (!_data) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      console.error("Invalid server environment variables:");
      console.error(z.prettifyError(parsed.error));
      process.exit(1);
    }
    _data = parsed.data;
  }
  return _data;
}

type ServerEnv = z.infer<typeof schema> & {
  isProd: boolean;
  isDev: boolean;
  isTest: boolean;
};

export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(_, prop) {
    const data = ensureParsed();
    if (prop === "isProd") return data.NODE_ENV === "production";
    if (prop === "isDev") return data.NODE_ENV === "development";
    if (prop === "isTest") return data.NODE_ENV === "test";
    return Reflect.get(data, prop);
  },
});
