import { Image } from "#/features/snacks/server/value-objects/image.vo";

describe("image value object", () => {
  it("should create an image from persistence data", () => {
    const data = {
      id: "123",
      url: "http://example.com/image.jpg",
      storageKey: "image.jpg",
      isPrimary: true,
      sortOrder: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    const image = Image.fromPersistence(data);

    expect(image).toMatchObject({
      id: "123",
      url: "http://example.com/image.jpg",
      storageKey: "image.jpg",
      isPrimary: true,
      sortOrder: 1,
    });
  });

  it("should create an image with default values", () => {
    const image = Image.create({
      id: "123",
      sortOrder: 1,
      isPrimary: false,
      url: "http://example.com/image.jpg",
      storageKey: "image.jpg",
    });

    expect(image).toMatchObject({
      id: "123",
      url: "http://example.com/image.jpg",
      storageKey: "image.jpg",
      isPrimary: false,
      sortOrder: 1,
    });
  });

  it("should make an image primary and secondary", () => {
    const image = Image.create({
      id: "123",
      sortOrder: 1,
      isPrimary: undefined,
      url: "http://example.com/image.jpg",
      storageKey: "image.jpg",
    });

    expect(image.getIsPrimary()).toBe(false);

    image.makePrimary();
    expect(image.getIsPrimary()).toBe(true);

    image.makeSecondary();
    expect(image.getIsPrimary()).toBe(false);
  });

  it("should update sort order", () => {
    const image1 = Image.create({
      id: "1",
      sortOrder: 1,
      isPrimary: false,
      url: "http://example.com/image1.jpg",
      storageKey: "image1.jpg",
    });

    const image2 = Image.create({
      id: "2",
      sortOrder: 2,
      isPrimary: false,
      url: "http://example.com/image2.jpg",
      storageKey: "image2.jpg",
    });

    expect(image1.getSortOrder()).toBe(1);
    expect(image2.getSortOrder()).toBe(2);

    image1.setSortOrder(3);
    image2.setSortOrder(1);

    expect(image1.getSortOrder()).toBe(3);
    expect(image2.getSortOrder()).toBe(1);
  });
});
