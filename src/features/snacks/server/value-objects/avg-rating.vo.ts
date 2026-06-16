export class AvgRating {
  private constructor(private readonly value: string) {}

  static create(value: string): AvgRating {
    const parsed = parseFloat(value);

    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
      throw new Error("AvgRating must be a number between 0 and 5");
    }

    return new AvgRating(value);
  }

  getValue(): string {
    return this.value;
  }
}
