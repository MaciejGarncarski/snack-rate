export class Rating {
  private constructor(private readonly value: number) {}

  static create(value: number | string): Rating {
    const parsed = typeof value === "string" ? Number(value) : value;

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 5) {
      throw new Error("Rating must be an integer between 1 and 5");
    }

    return new Rating(parsed);
  }

  getValue(): number {
    return this.value;
  }
}
