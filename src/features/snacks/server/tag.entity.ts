import { Slug } from "#/features/snacks/server/value-objects/slug.vo";

export class TagEntity {
  private constructor(
    private id: string,
    private name: string,
    private slug: Slug,
  ) {}

  public static create(params: { id: string; name: string; slug: string }) {
    return new TagEntity(params.id, params.name, Slug.create(params.slug));
  }

  public getName() {
    return this.name;
  }

  public getSlug(): string {
    return this.slug.getValue();
  }

  public getId() {
    return this.id;
  }
}
