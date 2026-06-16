import { Rating } from "#/features/snacks/server/value-objects/rating.vo";

describe("rating value object", () => {
  it("should create a rating value object with a valid rating", () => {
    const rating = Rating.create("4.5");
    expect(rating.getValue()).toBe("4.5");
  });

  it("should throw an error if the rating is not a number", () => {
    expect(() => Rating.create("not a number")).toThrow("Rating must be a number between 0 and 5");
  });

  it("should throw an error if the rating is less than 0", () => {
    expect(() => Rating.create("-1")).toThrow("Rating must be a number between 0 and 5");
  });

  it("should throw an error if the rating is greater than 5", () => {
    expect(() => Rating.create("6")).toThrow("Rating must be a number between 0 and 5");
  });
});
