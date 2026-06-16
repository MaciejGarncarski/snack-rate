export class ImgUrl {
  private constructor(private readonly value: string) {}

  public static create(value: string) {
    if (!value) throw new Error("URL cannot be empty");

    if (!/^https?:\/\/.+\..+/u.test(value)) {
      throw new Error("Invalid URL format");
    }

    return new ImgUrl(value);
  }

  public toString() {
    return this.value;
  }
}
