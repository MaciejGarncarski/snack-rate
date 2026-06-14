export class Rating {
  private constructor(private readonly value: number) {}

  static create(value: number): Rating {
    if (Number.isNaN(value)) {
      throw new TypeError("Rating must be a number");
    }

    if (!Number.isFinite(value)) {
      throw new TypeError("Invalid rating");
    }

    if (value < 0) {
      throw new Error("Rating cannot be negative");
    }

    if (value > 5) {
      throw new Error("Rating cannot exceed 5");
    }

    return new Rating(value);
  }

  getValue(): number {
    return this.value;
  }
}
