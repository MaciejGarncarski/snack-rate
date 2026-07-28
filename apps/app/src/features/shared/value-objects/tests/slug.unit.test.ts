import { Slug } from "#/features/shared/value-objects/slug.vo";

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

  it("should replace polish characters with their latin equivalents", () => {
    const slug = Slug.create("zażółć gęślą jaźń");
    expect(slug.getValue()).toBe("zazolc-gesla-jazn");
  });

  it("should replace spanish characters with their latin equivalents", () => {
    const slug = Slug.create("niño, jalapeño, año");
    expect(slug.getValue()).toBe("nino-jalapeno-ano");
  });

  it("should replace french characters with their latin equivalents", () => {
    const slug = Slug.create("français, élève, école");
    expect(slug.getValue()).toBe("francais-eleve-ecole");
  });

  it("should replace german characters with their latin equivalents", () => {
    const slug = Slug.create("straße, über, groß");
    expect(slug.getValue()).toBe("strasse-uber-gross");
  });

  it("should replace czech/slovak characters with their latin equivalents", () => {
    const slug = Slug.create("český, slovenský, žluťoučký");
    expect(slug.getValue()).toBe("cesky-slovensky-zlutoucky");
  });

  it("should return false when comparing two different slug value objects", () => {
    const slug1 = Slug.create("slug-1");
    const slug2 = Slug.create("slug-2");
    expect(slug1.equals(slug2)).toBe(false);
  });
});
