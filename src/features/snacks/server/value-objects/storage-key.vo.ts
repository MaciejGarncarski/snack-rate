export class StorageKey {
  private constructor(private readonly value: string) {}

  public static create(value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error("StorageKey cannot be empty");
    }

    return new StorageKey(value);
  }

  public toString() {
    return this.value;
  }
}
