import { Slug } from "#/features/shared/value-objects/slug.vo";

export class StorageKey {
  private constructor(private readonly value: string) {}

  public static create(slug: Slug, imageExtension: string) {
    if (!imageExtension || imageExtension.trim().length === 0) {
      throw new Error("StorageKey imageExtension cannot be empty");
    }

    if (slug.getValue().trim().length === 0) {
      throw new Error("StorageKey slug cannot be empty");
    }

    const storageKey = `${slug.getValue()}.${imageExtension}`;

    return new StorageKey(storageKey);
  }

  public getValue() {
    return this.value;
  }
}
