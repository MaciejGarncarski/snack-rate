import { eanSchema, optionalEanSchema } from "#/schemas/ean";

describe("EAN schemas", () => {
  it.each(["5901234123457", "96385074"])("accepts a valid EAN: %s", (value) => {
    expect(eanSchema.safeParse(value).success).toBe(true);
  });

  it.each(["5901234123458", "123", "abc", "59012341234567"])(
    "rejects an invalid EAN: %s",
    (value) => {
      expect(eanSchema.safeParse(value).success).toBe(false);
    },
  );

  it("trims valid input", () => {
    expect(eanSchema.parse(" 5901234123457 ")).toBe("5901234123457");
  });

  it("allows an omitted or empty optional EAN", () => {
    expect(optionalEanSchema.parse("")).toBe("");
  });

  it("rejects an invalid optional EAN", () => {
    expect(optionalEanSchema.safeParse("5901234123458").success).toBe(false);
  });
});
