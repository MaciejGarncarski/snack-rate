import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";

describe("StorageKey value object", () => {
  describe("create", () => {
    it("should create a valid StorageKey", () => {
      const storageKey = StorageKey.create("snack-rate");
      expect(storageKey.getValue()).toBe("snack-rate");
    });

    it("should throw when value is empty string", () => {
      expect(() => StorageKey.create("")).toThrow("StorageKey cannot be empty");
    });

    it("should throw when value is only whitespace", () => {
      expect(() => StorageKey.create("   ")).toThrow("StorageKey cannot be empty");
    });
  });
});
