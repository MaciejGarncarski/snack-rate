import { resolveIdentity, whereUserOrGuest, whereUserOrGuestSql } from "../identity";

describe("resolveIdentity", () => {
  it("should return userId when provided", () => {
    const result = resolveIdentity("user-123", null);
    expect(result).toEqual({ column: "userId", value: "user-123" });
  });

  it("should return guestId when userId is null", () => {
    const result = resolveIdentity(null, "guest-456");
    expect(result).toEqual({ column: "guestId", value: "guest-456" });
  });

  it("should prefer userId over guestId when both provided", () => {
    const result = resolveIdentity("user-123", "guest-456");
    expect(result).toEqual({ column: "userId", value: "user-123" });
  });

  it("should throw when neither userId nor guestId provided", () => {
    expect(() => resolveIdentity(null, null)).toThrow("Either userId or guestId must be provided");
  });

  it("should throw when guestId is empty string", () => {
    expect(() => resolveIdentity(null, "")).toThrow("Either userId or guestId must be provided");
  });
});

describe("whereUserOrGuest", () => {
  it("should return filter with userId when provided", () => {
    const result = whereUserOrGuest("snack-1", "user-123", null);
    expect(result).toEqual({
      snackItemId: "snack-1",
      userId: "user-123",
      rating: { isNotNull: true },
      deletedAt: { isNull: true },
    });
  });

  it("should return filter with guestId when userId is null", () => {
    const result = whereUserOrGuest("snack-1", null, "guest-456");
    expect(result).toEqual({
      snackItemId: "snack-1",
      guestId: "guest-456",
      rating: { isNotNull: true },
      deletedAt: { isNull: true },
    });
  });

  it("should throw when neither provided", () => {
    expect(() => whereUserOrGuest("snack-1", null, null)).toThrow(
      "Either userId or guestId must be provided",
    );
  });
});

describe("whereUserOrGuestSql", () => {
  it("should return SQL expression (no throw)", () => {
    const result = whereUserOrGuestSql("snack-1", "user-123", null);
    expect(result).toBeDefined();
  });

  it("should throw when neither provided", () => {
    expect(() => whereUserOrGuestSql("snack-1", null, null)).toThrow(
      "Either userId or guestId must be provided",
    );
  });
});
