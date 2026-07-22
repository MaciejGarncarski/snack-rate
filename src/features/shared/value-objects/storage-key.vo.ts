import { Slug } from "#/features/shared/value-objects/slug.vo";
import { nanoid } from "nanoid";

export class StorageKey {
  private constructor(private readonly value: string) {}

  public static create(slug: Slug, imageExtension: string) {
    if (!imageExtension || imageExtension.trim().length === 0) {
      throw new Error("StorageKey imageExtension cannot be empty");
    }

    const storageKey = `${slug.getValue()}.${nanoid()}.${imageExtension}`;

    return new StorageKey(storageKey);
  }

  public static createThumb(slug: Slug, imageExtension: string) {
    if (!imageExtension || imageExtension.trim().length === 0) {
      throw new Error("StorageKey imageExtension cannot be empty");
    }

    if (slug.getValue().trim().length === 0) {
      throw new Error("StorageKey slug cannot be empty");
    }

    const storageKey = `${slug.getValue()}.${nanoid()}-thumb.${imageExtension}`;

    return new StorageKey(storageKey);
  }

  public getValue() {
    return this.value;
  }
}
