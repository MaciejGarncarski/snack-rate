import { Image } from "#/features/snacks/server/image.entity";

describe("Image entity", () => {
  const baseCreateParams = {
    id: "123",
    url: "http://example.com/image.jpg",
    storageKey: "image.jpg",
    isPrimary: false,
    sortOrder: 1,
  };

  const basePersistenceParams = {
    ...baseCreateParams,
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-02"),
    deletedAt: null,
  };

  describe("Image.create", () => {
    it("should create an image with the given values", () => {
      const image = Image.create(baseCreateParams);

      expect(image.getId()).toBe("123");
      expect(image.getUrl()).toBe("http://example.com/image.jpg");
      expect(image.getStorageKey()).toBe("image.jpg");
      expect(image.getIsPrimary()).toBe(false);
      expect(image.getSortOrder()).toBe(1);
    });

    it("should default isPrimary to false when undefined", () => {
      const image = Image.create({ ...baseCreateParams, isPrimary: undefined });

      expect(image.getIsPrimary()).toBe(false);
    });
  });

  describe("Image.fromPersistence", () => {
    it("should restore an image from persistence data", () => {
      const image = Image.fromPersistence(basePersistenceParams);

      expect(image.getId()).toBe("123");
      expect(image.getUrl()).toBe("http://example.com/image.jpg");
      expect(image.getStorageKey()).toBe("image.jpg");
      expect(image.getIsPrimary()).toBe(false);
      expect(image.getSortOrder()).toBe(1);
    });

    it("should restore createdAt, updatedAt, and deletedAt", () => {
      const image = Image.fromPersistence(basePersistenceParams);

      expect(image.getCreatedAt()).toEqual(new Date("2024-01-01"));
      expect(image.getUpdatedAt()).toEqual(new Date("2024-01-02"));
      expect(image.getDeletedAt()).toBeNull();
    });

    it("should restore a non-null deletedAt", () => {
      const deletedAt = new Date("2024-06-01");
      const image = Image.fromPersistence({ ...basePersistenceParams, deletedAt });

      expect(image.getDeletedAt()).toEqual(deletedAt);
    });
  });

  describe("setPrimary", () => {
    it("should set image as primary", () => {
      const image = Image.create({ ...baseCreateParams, isPrimary: false });

      image.setPrimary(true);

      expect(image.getIsPrimary()).toBe(true);
    });

    it("should set image as non-primary", () => {
      const image = Image.create({ ...baseCreateParams, isPrimary: true });

      image.setPrimary(false);

      expect(image.getIsPrimary()).toBe(false);
    });
  });

  describe("setSortOrder", () => {
    it("should update the sort order", () => {
      const image = Image.create({ ...baseCreateParams, sortOrder: 1 });

      image.setSortOrder(5);

      expect(image.getSortOrder()).toBe(5);
    });

    it("should allow sort order of 0", () => {
      const image = Image.create({ ...baseCreateParams, sortOrder: 3 });

      image.setSortOrder(0);

      expect(image.getSortOrder()).toBe(0);
    });

    it("should allow swapping sort orders between two images", () => {
      const image1 = Image.create({ ...baseCreateParams, id: "1", sortOrder: 1 });
      const image2 = Image.create({ ...baseCreateParams, id: "2", sortOrder: 2 });

      image1.setSortOrder(2);
      image2.setSortOrder(1);

      expect(image1.getSortOrder()).toBe(2);
      expect(image2.getSortOrder()).toBe(1);
    });
  });
});
