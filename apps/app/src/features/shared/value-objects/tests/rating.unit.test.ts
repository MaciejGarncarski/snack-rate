import { Rating } from "#/features/shared/value-objects/rating.vo";

describe("rating value object", () => {
  it("should create a rating value object with a valid rating", () => {
    const rating = Rating.create("4.5");
    expect(rating.getValue()).toBe(4.5);
  });

  it("should create from a number directly", () => {
    const rating = Rating.create(3);
    expect(rating.getValue()).toBe(3);
  });

  it("should throw if not a number", () => {
    expect(() => Rating.create("not a number")).toThrow("Rating must be a number between 0 and 5");
  });

  it("should throw if less than 0", () => {
    expect(() => Rating.create("-1")).toThrow("Rating must be a number between 0 and 5");
  });

  it("should throw if greater than 5", () => {
    expect(() => Rating.create("6")).toThrow("Rating must be a number between 0 and 5");
  });

  it("should throw if not in 0.5 increments", () => {
    expect(() => Rating.create(3.2)).toThrow("Rating must be in 0.5 increments");
  });

  it("should accept 0 as valid", () => {
    const rating = Rating.create(0);
    expect(rating.getValue()).toBe(0);
  });
});
