import { Price } from "#/features/shared/value-objects/price.vo";

describe("Price value object", () => {
  it("should create a price from a valid number", () => {
    const price = Price.create(9.99);
    expect(price.getValue()).toBe(9.99);
  });

  it("should throw an error for a non-numeric value", () => {
    expect(() => Price.create("abc" as any)).toThrow("Invalid price");
  });

  it("should throw an error for a negative price", () => {
    expect(() => Price.create(-5)).toThrow("Price cannot be negative");
  });

  it("should throw an error for a zero price", () => {
    expect(() => Price.create(0)).toThrow("Price cannot be zero");
  });

  it("should throw an error for a price exceeding the maximum", () => {
    expect(() => Price.create(1000000)).toThrow("Price cannot exceed 999.99");
  });

  it("should throw an error for infinite values", () => {
    expect(() => Price.create(Infinity)).toThrow("Invalid price");
  });

  it("should add two prices together", () => {
    const price1 = Price.create(5);
    const price2 = Price.create(3);
    const totalPrice = price1.add(price2);
    expect(totalPrice.getValue()).toBe(8);
  });
});
