const MAX_PRICE = 999.99;

export class Price {
  private constructor(private readonly value: number) {}

  static create(value: number): Price {
    if (Number.isNaN(value)) {
      throw new TypeError("Price must be a number");
    }

    if (!Number.isFinite(value)) {
      throw new TypeError("Invalid price");
    }

    if (value < 0) {
      throw new Error("Price cannot be negative");
    }

    if (value > MAX_PRICE) {
      throw new Error(`Price cannot exceed ${MAX_PRICE}`);
    }

    return new Price(value);
  }

  add(other: Price): Price {
    return Price.create(this.value + other.value);
  }

  getValue(): number {
    return this.value;
  }
}
