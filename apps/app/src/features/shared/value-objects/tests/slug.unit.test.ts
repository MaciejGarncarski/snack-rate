import {
  MAX_SLUG_LENGTH,
  MAX_SLUG_TOTAL_LENGTH,
  SLUG_NANOID_LENGTH,
  Slug,
} from "#/features/shared/value-objects/slug.vo";

function splitSlug(value: string) {
  const suffix = value.slice(-SLUG_NANOID_LENGTH);
  const hyphen = value.at(-SLUG_NANOID_LENGTH - 1);
  const base = value.slice(0, -SLUG_NANOID_LENGTH - 1);

  return { base, suffix, hyphen };
}

function isLowerAlphanumeric(value: string) {
  for (const char of value) {
    const isDigit = char >= "0" && char <= "9";
    const isLower = char >= "a" && char <= "z";

    if (!isDigit && !isLower) {
      return false;
    }
  }

  return true;
}

function isValidSlugChars(value: string) {
  for (const char of value) {
    const isDigit = char >= "0" && char <= "9";
    const isLower = char >= "a" && char <= "z";

    if (!isDigit && !isLower && char !== "-") {
      return false;
    }
  }

  return true;
}

function expectValidSuffix(suffix: string) {
  expect(suffix).toHaveLength(SLUG_NANOID_LENGTH);
  expect(isLowerAlphanumeric(suffix)).toBe(true);
}

describe("slug value object", () => {
  it("should create a slug with nanoid suffix", () => {
    const { base, suffix, hyphen } = splitSlug(Slug.create("valid-slug").getValue());

    expect(base).toBe("valid-slug");
    expect(hyphen).toBe("-");
    expectValidSuffix(suffix);
  });

  it("should throw for invalid slug", () => {
    expect(() => Slug.create("")).toThrow("Invalid slug");
    expect(() => Slug.create("   ")).toThrow("Invalid slug");
  });

  it("should be equal to itself", () => {
    const slug = Slug.create("equal-slug");

    expect(slug.equals(slug)).toBe(true);
  });

  it("should not be equal for same input because suffix is random", () => {
    const slug1 = Slug.create("equal-slug");
    const slug2 = Slug.create("equal-slug");

    expect(slug1.equals(slug2)).toBe(false);
    expect(slug1.getValue()).not.toBe(slug2.getValue());
  });

  it("should not be equal for different inputs", () => {
    const slug1 = Slug.create("slug-1");
    const slug2 = Slug.create("slug-2");

    expect(slug1.equals(slug2)).toBe(false);
  });

  it("should normalize spaces and punctuation", () => {
    const { base } = splitSlug(Slug.create("Hello, World!").getValue());

    expect(base).toBe("hello-world");
  });

  it("should replace polish characters", () => {
    const { base } = splitSlug(Slug.create("zażółć gęślą jaźń").getValue());

    expect(base).toBe("zazolc-gesla-jazn");
  });

  it("should replace spanish characters", () => {
    const { base } = splitSlug(Slug.create("niño, jalapeño, año").getValue());

    expect(base).toBe("nino-jalapeno-ano");
  });

  it("should replace french characters", () => {
    const { base } = splitSlug(Slug.create("français, élève, école").getValue());

    expect(base).toBe("francais-eleve-ecole");
  });

  it("should replace german characters", () => {
    const { base } = splitSlug(Slug.create("straße, über, groß").getValue());

    expect(base).toBe("strasse-uber-gross");
  });

  it("should replace czech and slovak characters", () => {
    const { base } = splitSlug(Slug.create("český, slovenský, žluťoučký").getValue());

    expect(base).toBe("cesky-slovensky-zlutoucky");
  });

  it("should always contain only allowed characters", () => {
    const value = Slug.create("  -- Hello, World! This is a slug --  ").getValue();

    expect(isValidSlugChars(value)).toBe(true);
    expect(value.startsWith("-")).toBe(false);

    const { base } = splitSlug(value);

    expect(base.startsWith("-")).toBe(false);
    expect(base.endsWith("-")).toBe(false);
    expect(base.includes("--")).toBe(false);
  });
});

describe("slug value object - length", () => {
  it("should keep a short slug unchanged", () => {
    const value = Slug.create("short slug").getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe("short-slug");
    expectValidSuffix(suffix);
    expect(value).toHaveLength("short-slug".length + 1 + SLUG_NANOID_LENGTH);
  });

  it("should keep a slug exactly at the maximum base length", () => {
    const input = "a".repeat(MAX_SLUG_LENGTH);
    const value = Slug.create(input).getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe(input);
    expectValidSuffix(suffix);
    expect(value).toHaveLength(MAX_SLUG_TOTAL_LENGTH);
  });

  it("should truncate a long single word to the maximum base length", () => {
    const input = "a".repeat(MAX_SLUG_LENGTH + 10);
    const value = Slug.create(input).getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe("a".repeat(MAX_SLUG_LENGTH));
    expectValidSuffix(suffix);
    expect(value).toHaveLength(MAX_SLUG_TOTAL_LENGTH);
  });

  it("should truncate at the previous word boundary", () => {
    const input = "this is a very long slug that contains many additional words";

    const value = Slug.create(input).getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe("this-is-a-very-long-slug-that");
    expect(base.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expectValidSuffix(suffix);
  });

  it("should not include a trailing hyphen after truncation", () => {
    const input = `${"a".repeat(MAX_SLUG_LENGTH - 1)} b c`;
    const value = Slug.create(input).getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe("a".repeat(MAX_SLUG_LENGTH - 1));
    expect(base.endsWith("-")).toBe(false);
    expectValidSuffix(suffix);
  });

  it("should keep the first word when it is longer than the maximum length", () => {
    const input = "supercalifragilisticexpialidocious something else";

    const value = Slug.create(input).getValue();
    const { base, suffix } = splitSlug(value);

    expect(base).toBe("supercalifragilisticexpialidocious");
    expect(base.length).toBeLessThanOrEqual(MAX_SLUG_LENGTH);
    expectValidSuffix(suffix);
  });

  it("should never exceed the maximum total length", () => {
    const inputs = [
      "short slug",
      "a".repeat(100),
      "this is a very long slug with lots of words that keeps going",
      "zażółć gęślą jaźń ".repeat(20),
    ];

    for (const input of inputs) {
      const value = Slug.create(input).getValue();

      expect(value.length).toBeLessThanOrEqual(MAX_SLUG_TOTAL_LENGTH);
      expect(isValidSlugChars(value)).toBe(true);
    }
  });

  it("should always append a valid suffix", () => {
    const values = [
      Slug.create("short").getValue(),
      Slug.create("a".repeat(100)).getValue(),
      Slug.create("this is a long slug").getValue(),
    ];

    for (const value of values) {
      const { suffix, hyphen } = splitSlug(value);

      expect(hyphen).toBe("-");
      expectValidSuffix(suffix);
    }
  });

  it("should generate different suffixes for the same input", () => {
    const values = new Set(Array.from({ length: 10 }, () => Slug.create("same input").getValue()));

    expect(values.size).toBeGreaterThan(1);
  });

  it("should generate different suffixes for long inputs", () => {
    const input = "a".repeat(100);

    const values = new Set(Array.from({ length: 10 }, () => Slug.create(input).getValue()));

    expect(values.size).toBeGreaterThan(1);
  });
});
