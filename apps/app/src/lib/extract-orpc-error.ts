import { ORPCError } from "@orpc/client";

export function extractORPCError(
  err: unknown,
): { code: string; message: string; data?: any } | null {
  if (err instanceof ORPCError) {
    return {
      code: err.code,
      message: err.message,
      data: err.data,
    };
  }

  return null;
}
