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
    return [...this.images].toSorted((a, b) => a.getSortOrder() - b.getSortOrder());
  }

  public addImage(image: Image) {
    const nextOrder =
      this.images.length === 0 ? 0 : Math.max(...this.images.map((i) => i.getSortOrder()), -1) + 1;

    image.setSortOrder(nextOrder);

    this.images.push(image);

    this.touch();
  }

  public setPrimaryImage(imageId: string) {
    this.images.forEach((img) => img.makeSecondary());

    const img = this.images.find((i) => i.getId() === imageId);

    if (!img) throw new Error("Image not found");

    img.makePrimary();

    this.touch();
  }

  public reorderImages(imageIdsInOrder: string[]) {
    const imageMap = new Map(this.images.map((img) => [img.getId(), img]));

    imageIdsInOrder.forEach((id, index) => {
      const img = imageMap.get(id);
      if (!img) return;

      img.setSortOrder(index);
    });

    this.touch();
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
    return this.avgRating;
  }

  public updateName(newName: string) {
    this.name = newName;
    this.touch();
  }

  public updateDescription(newDescription: string | null) {
    this.description = newDescription;
    this.touch();
  }

  public changePriceTo(newPrice: Price) {
    if (newPrice.getValue() === this.price.getValue()) return;
    this.price = newPrice;
    this.touch();
  }

  public updateBrandId(newBrandId: string | null) {
    this.brandId = newBrandId;
    this.touch();
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
