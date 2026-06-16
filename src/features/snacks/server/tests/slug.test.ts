import { Slug } from "#/features/snacks/server/value-objects/slug.vo";

describe("slug value object", () => {
  it("should create a slug value object with a valid slug", () => {
    const slug = Slug.create("valid-slug");
    expect(slug.getValue()).toBe("valid-slug");
  });
});
