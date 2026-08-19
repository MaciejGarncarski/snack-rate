import { ORPCError } from "@orpc/client";

export function extractORPCError(
  cause: unknown,
): { code: string; message: string; data?: unknown } | null {
  if (cause instanceof ORPCError) {
    return {
      code: cause.code,
      message: cause.message,
      data: cause.data,
    };
  }

  return null;
}
