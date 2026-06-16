import { AvgRating } from "#/features/snacks/server/value-objects/avg-rating.vo";

describe("avg rating value object", () => {
  it("should create an avg rating value object with a valid avg rating", () => {
    const avgRating = AvgRating.create("4.5");
    expect(avgRating.getValue()).toBe("4.5");
  });

  it("should throw an error if the avg rating is not a number", () => {
    expect(() => AvgRating.create("not a number")).toThrow(
      "AvgRating must be a number between 0 and 5",
    );
  });

  it("should throw an error if the avg rating is less than 0", () => {
    expect(() => AvgRating.create("-1")).toThrow("AvgRating must be a number between 0 and 5");
  });

  it("should throw an error if the avg rating is greater than 5", () => {
    expect(() => AvgRating.create("6")).toThrow("AvgRating must be a number between 0 and 5");
  });
});
