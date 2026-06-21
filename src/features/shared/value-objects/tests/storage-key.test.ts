import { Slug } from "#/features/shared/value-objects/slug.vo";
import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";

describe("StorageKey value object", () => {
  describe("create", () => {
    it("should create a valid StorageKey with slug and image extension", () => {
      const slug = Slug.create("Monster Energy");
      const storageKey = StorageKey.create(slug, "jpg");
      const value = storageKey.getValue();

      expect(value).toBe(`monster-energy.jpg`);
    });

    it("should throw when imageExtension is empty", () => {
      const slug = Slug.create("Chips");
      expect(() => StorageKey.create(slug, "")).toThrow(
        "StorageKey imageExtension cannot be empty",
      );
    });

    it("should throw when imageExtension is only whitespace", () => {
      const slug = Slug.create("Chips");
      expect(() => StorageKey.create(slug, "   ")).toThrow(
        "StorageKey imageExtension cannot be empty",
      );
    });
  });
});
