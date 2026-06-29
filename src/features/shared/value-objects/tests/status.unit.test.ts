import { Status } from "#/features/shared/value-objects/status.vo";

describe("Status value object", () => {
  describe("create", () => {
    it("should create a valid Status", () => {
      const status = Status.create("published");
      expect(status.getValue()).toBe("published");
    });

    it("should throw when value is not a valid status", () => {
      expect(() => Status.create("invalid")).toThrow(/invalid status/giu);
    });
  });

  describe("isPublished", () => {
    it("should return true for published status", () => {
      const status = Status.create("published");
      expect(status.isPublished()).toBe(true);
    });

    it("should return false for non-published status", () => {
      const status = Status.create("pending");
      expect(status.isPublished()).toBe(false);
    });
  });
});
