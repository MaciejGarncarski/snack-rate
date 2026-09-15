import { ORPCError } from "@orpc/client";

import { extractORPCError } from "#/lib/extract-orpc-error";

describe("extract orpc error", () => {
  it("should extract code and message from an ORPCError", () => {
    const error = new ORPCError("NOT_FOUND", { message: "Nie znaleziono." });

    expect(extractORPCError(error)).toMatchObject({
      code: "NOT_FOUND",
      message: "Nie znaleziono.",
    });
  });

  it("should return null for plain errors", () => {
    expect(extractORPCError(new Error("boom"))).toBeNull();
  });

  it("should return null for non-errors", () => {
    expect(extractORPCError(null)).toBeNull();
    expect(extractORPCError("NOT_FOUND")).toBeNull();
  });
});
