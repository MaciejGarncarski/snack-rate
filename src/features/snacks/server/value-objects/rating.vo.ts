export class Rating {
  constructor(public readonly value: string) {
    const numericValue = typeof value === "string" ? parseFloat(value) : value;

    if (numericValue < 0 || numericValue > 5) {
      throw new Error("Rating must be between 0 and 5");
    }
  }
}
