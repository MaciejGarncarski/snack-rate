export class Rating {
  private constructor(private readonly value: number) {}

  static create(value: number | string): Rating {
    const parsed = typeof value === "string" ? Number(value) : value;

    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
      throw new Error("Rating must be a number between 0 and 5");
    }

    if (parsed !== 0 && parsed % 0.5 !== 0) {
      throw new Error("Rating must be in 0.5 increments");
    }

    return new Rating(parsed);
  }

  getValue(): number {
    return this.value;
  }
}
