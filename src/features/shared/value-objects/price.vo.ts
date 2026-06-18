const MAX_PRICE = 999.99;

export class Price {
  private constructor(private readonly value: number) {}

  static create(value: number): Price {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
      throw new TypeError("Invalid price");
    }

    if (!Number.isFinite(parsed)) {
      throw new TypeError("Invalid price");
    }

    if (parsed < 0) {
      throw new Error("Price cannot be negative");
    }

    if (parsed === 0) {
      throw new Error("Price cannot be zero");
    }

    if (parsed > MAX_PRICE) {
      throw new Error(`Price cannot exceed ${MAX_PRICE}`);
    }

    return new Price(parsed);
  }

  add(other: Price): Price {
    return Price.create(this.value + other.value);
  }

  getValue(): number {
    return this.value;
  }
}
