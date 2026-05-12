import * as z from "zod";

export function parseEnv<TSchema extends z.ZodType>(
  schema: TSchema,
  input: unknown,
  target: "client" | "server",
): z.output<TSchema> {
  const parsed = schema.safeParse(input);

  if (parsed.success) {
    return parsed.data;
  }

  const formattedError = z.prettifyError(parsed.error);
  throw new Error(`Invalid ${target} environment variables\n${formattedError}`);
}
