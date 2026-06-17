export class AvgRating {
  private constructor(private readonly value: number) {}

  static create(value: number | string): AvgRating {
    const parsed = typeof value === "string" ? parseFloat(value) : value;

    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
      throw new Error("AvgRating must be a number between 0 and 5");
    }

    return new AvgRating(parsed);
  }

  getValue(): number {
    return this.value;
  }
}
