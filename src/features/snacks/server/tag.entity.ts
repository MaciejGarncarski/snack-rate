export class TagEntity {
  private constructor(
    private id: string,
    private name: string,
    private slug: string,
  ) {}

  public static create(params: { id: string; name: string; slug: string }) {
    return new TagEntity(params.id, params.name, params.slug);
  }

  public getName() {
    return this.name;
  }

  public getSlug() {
    return this.slug;
  }

  public getId() {
    return this.id;
  }
}
