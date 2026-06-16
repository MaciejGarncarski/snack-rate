export class SortOrder {
  private constructor(private readonly value: number) {}

  public static create(value: number) {
    if (!Number.isInteger(value)) {
      throw new TypeError("SortOrder must be an integer");
    }

    if (value < 0) {
      throw new Error("SortOrder cannot be negative");
    }

    return new SortOrder(value);
  }

  public valueOf() {
    return this.value;
  }
}
