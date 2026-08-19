import { resolveIdentity, whereAuthor, whereAuthorSql } from "../identity";

describe("resolveIdentity", () => {
  it("should return authorId and authorType when provided", () => {
    const result = resolveIdentity("user-123", "user");
    expect(result).toEqual({ authorId: "user-123", authorType: "user" });
  });

  it("should return guest identity when guestId is provided", () => {
    const result = resolveIdentity("guest-456", "guest");
    expect(result).toEqual({ authorId: "guest-456", authorType: "guest" });
  });

  it("should throw when authorId is missing", () => {
    expect(() => resolveIdentity(null, "guest")).toThrow(
      "Either authorId with authorType must be provided",
    );
  });

  it("should throw when authorId is empty string", () => {
    expect(() => resolveIdentity("", "guest")).toThrow(
      "Either authorId with authorType must be provided",
    );
  });
});

describe("whereAuthor", () => {
  it("should return filter with authorId and authorType for user", () => {
    const result = whereAuthor("snack-1", "user-123", "user");
    expect(result).toEqual({
      snackItemId: "snack-1",
      authorId: "user-123",
      authorType: "user",
      rating: { isNotNull: true },
      deletedAt: { isNull: true },
    });
  });

  it("should return filter with authorId and authorType for guest", () => {
    const result = whereAuthor("snack-1", "guest-456", "guest");
    expect(result).toEqual({
      snackItemId: "snack-1",
      authorId: "guest-456",
      authorType: "guest",
      rating: { isNotNull: true },
      deletedAt: { isNull: true },
    });
  });

  it("should throw when authorId is null", () => {
    expect(() => whereAuthor("snack-1", null, "guest")).toThrow(
      "Either authorId with authorType must be provided",
    );
  });
});

describe("whereAuthorSql", () => {
  it("should return SQL expression (no throw)", () => {
    const result = whereAuthorSql("snack-1", "user-123", "user");
    expect(result).toBeDefined();
  });

  it("should throw when authorId is null", () => {
    expect(() => whereAuthorSql("snack-1", null, "guest")).toThrow(
      "Either authorId with authorType must be provided",
    );
  });
});
