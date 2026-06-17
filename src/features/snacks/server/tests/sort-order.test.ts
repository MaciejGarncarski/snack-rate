import { SortOrder } from "#/features/snacks/server/value-objects/sort-order.vo";

describe("SortOrder value object", () => {
  describe("create", () => {
    it("should create a valid SortOrder", () => {
      const sortOrder = SortOrder.create(5);
      expect(sortOrder.getValue()).toBe(5);
    });

    it("should throw when value is not an integer", () => {
      expect(() => SortOrder.create(5.5)).toThrow("SortOrder must be an integer");
    });

    it("should throw when value is negative", () => {
      expect(() => SortOrder.create(-1)).toThrow("SortOrder cannot be negative");
    });
  });
});
