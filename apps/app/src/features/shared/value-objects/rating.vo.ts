export class Rating {
  private constructor(private readonly value: number) {}

  static create(value: number | string): Rating {
    const parsed = Number(value);

    if (!Number.isInteger(parsed) || parsed < 1 || parsed > 10) {
      throw new Error("Rating must be an integer between 1 and 10");
    }

    return new Rating(parsed);
  }

  getValue(): number {
    return this.value;
  }
}
