export class TagEntity {
  constructor(
    private id: string,
    private name: string,
    private slug: string,
  ) {}

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
