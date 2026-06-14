export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(input: string): Slug {
    const normalized = input
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/g, "-")
      .replaceAll(/(^-|-$)/g, "");

    if (!normalized) {
      throw new Error("Invalid slug");
    }

    return new Slug(normalized);
  }

  toString() {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
