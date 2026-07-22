import { Slug } from "@/features/shared/value-objects/slug.vo";

describe("slug value object", () => {
  it("should create a slug value object with a valid slug", () => {
    const slug = Slug.create("valid-slug");
    expect(slug.getValue()).toBe("valid-slug");
  });

  it("should throw an error when creating a slug value object with an invalid slug", () => {
    expect(() => Slug.create("")).toThrow("Invalid slug");
    expect(() => Slug.create("   ")).toThrow("Invalid slug");
  });

  it("should return true when comparing two equal slug value objects", () => {
    const slug1 = Slug.create("equal-slug");
    const slug2 = Slug.create("equal-slug");
    expect(slug1.equals(slug2)).toBe(true);
  });
});
