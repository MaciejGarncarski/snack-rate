export class Rating {
  private constructor(private readonly value: string) {}

  static create(value: string): Rating {
    const parsed = parseFloat(value);

    if (isNaN(parsed) || parsed < 0 || parsed > 5) {
      throw new Error("Rating must be a number between 0 and 5");
    }

    return new Rating(value);
  }

  getValue(): string {
    return this.value;
  }
}
