import { Rating } from "#/features/shared/value-objects/rating.vo";

describe("rating value object", () => {
  it("should create a rating value object with a valid rating", () => {
    const rating = Rating.create("4");
    expect(rating.getValue()).toBe(4);
  });

  it("should create from a number directly", () => {
    const rating = Rating.create(3);
    expect(rating.getValue()).toBe(3);
  });

  it("should throw if not a number", () => {
    expect(() => Rating.create("not a number")).toThrow(
      "Rating must be an integer between 1 and 5",
    );
  });

  it("should throw if less than 1", () => {
    expect(() => Rating.create("0")).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw if greater than 5", () => {
    expect(() => Rating.create("6")).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw if not an integer", () => {
    expect(() => Rating.create(3.2)).toThrow("Rating must be an integer between 1 and 5");
    expect(() => Rating.create(3.5)).toThrow("Rating must be an integer between 1 and 5");
  });
});
