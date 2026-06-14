import type { TagEntity } from "#/features/snacks/server/tag.entity";
import type { Image } from "#/features/snacks/server/value-objects/image.vo";
import type { Price } from "#/features/snacks/server/value-objects/price.vo";
import type { Rating } from "#/features/snacks/server/value-objects/rating.vo";
import type { Slug } from "#/features/snacks/server/value-objects/slug.vo";

export class SnackAggregate {
  constructor(
    private id: string,
    private name: string,
    private description: string | null,
    private price: Price,
    private images: Image[],
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
    private brandId: string | null,
    private snackTags: TagEntity[],
    private slug: Slug,
    private barcode: string | null,
    private avgRating: Rating,
  ) {}

  public getId() {
    return this.id;
  }

  public getName() {
    return this.name;
  }

  public getDescription() {
    return this.description;
  }

  public getPrice() {
    return this.price;
  }

  public getImages() {
    return [...this.images];
  }

  public getPrimaryImage() {
    return this.images.find((img) => img.getIsPrimary()) ?? null;
  }

  public getCreatedAt() {
    return this.createdAt;
  }

  public getUpdatedAt() {
    return this.updatedAt;
  }

  public getDeletedAt() {
    return this.deletedAt;
  }

  public getBrandId() {
    return this.brandId;
  }

  public getTags() {
    return [...this.snackTags];
  }

  public getSlug() {
    return this.slug.toString();
  }

  public getBarcode() {
    return this.barcode;
  }

  public getRating() {
    return this.avgRating.getValue().toString();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
