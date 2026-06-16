export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(input: string): Slug {
    const normalized = input
      .trim()
      .toLowerCase()
      .replaceAll(/[^a-z0-9]+/gu, "-")
      .replaceAll(/(^-|-$)/gu, "");

    if (!normalized) {
      throw new Error("Invalid slug");
    }

    return new Slug(normalized);
  }

  getValue() {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
