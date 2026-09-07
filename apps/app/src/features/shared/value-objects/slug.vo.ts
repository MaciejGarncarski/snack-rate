import { customAlphabet } from "nanoid";

export const MAX_SLUG_LENGTH = 35;
export const SLUG_NANOID_LENGTH = 5;
export const MAX_SLUG_TOTAL_LENGTH = MAX_SLUG_LENGTH + 1 + SLUG_NANOID_LENGTH;

const slugNanoid = customAlphabet("0123456789abcdefghijklmnopqrstuvwxyz", SLUG_NANOID_LENGTH);

export class Slug {
  private readonly value: string;

  private constructor(value: string) {
    this.value = value;
  }

  static create(input: string): Slug {
    const normalized = input
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replaceAll(/[\u0300-\u036F]/gu, "")
      .replaceAll("ł", "l")
      .replaceAll("đ", "d")
      .replaceAll("ß", "ss")
      .replaceAll(/[^a-z0-9]+/gu, "-")
      .replaceAll(/(^-|-$)/gu, "");

    if (!normalized) {
      throw new Error("Invalid slug");
    }

    const base = Slug.truncateBase(normalized);

    return new Slug(`${base}-${slugNanoid()}`);
  }

  private static truncateBase(value: string): string {
    if (value.length <= MAX_SLUG_LENGTH) {
      return value;
    }

    const truncated = value.slice(0, MAX_SLUG_LENGTH);
    const lastHyphen = truncated.lastIndexOf("-");

    if (lastHyphen === -1) {
      return truncated;
    }

    return truncated.slice(0, lastHyphen);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: Slug): boolean {
    return this.value === other.value;
  }
}
