import type { Image } from "#/features/snacks/server/image.entity";
import type { TagEntity } from "#/features/snacks/server/tag.entity";
import type { AvgRating } from "#/features/snacks/server/value-objects/avg-rating.vo";
import type { Price } from "#/features/snacks/server/value-objects/price.vo";
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
    private avgRating: AvgRating,
  ) {}

  private assertNotDeleted() {
    if (this.deletedAt !== null) {
      throw new Error("Snack is deleted");
    }
  }

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
    return this.slug;
  }

  public getBarcode() {
    return this.barcode;
  }

  public getRating() {
    return this.avgRating;
  }

  public updateName(newName: string) {
    this.assertNotDeleted();
    this.name = newName;
    this.touch();
  }

  public updateDescription(newDescription: string | null) {
    this.assertNotDeleted();
    this.description = newDescription;
    this.touch();
  }

  public changePriceTo(newPrice: Price) {
    this.assertNotDeleted();
    if (newPrice.getValue() === this.price.getValue()) return;
    this.price = newPrice;
    this.touch();
  }

  public updateBrandId(newBrandId: string | null) {
    this.assertNotDeleted();
    this.brandId = newBrandId;
    this.touch();
  }

  public getImages() {
    return this.images
      .toSorted((a, b) => a.getSortOrder() - b.getSortOrder())
      .map((img) => ({
        id: img.getId(),
        url: img.getUrl(),
        isPrimary: img.getIsPrimary(),
        sortOrder: img.getSortOrder(),
        createdAt: img.getCreatedAt(),
        updatedAt: img.getUpdatedAt(),
        deletedAt: img.getDeletedAt(),
        storageKey: img.getStorageKey(),
      }));
  }

  public getPrimaryImage() {
    return this.images.find((img) => img.getIsPrimary()) ?? null;
  }

  public addImage(image: Image) {
    this.assertNotDeleted();

    const nextOrder =
      this.images.length === 0 ? 0 : Math.max(...this.images.map((i) => i.getSortOrder())) + 1;

    image.setSortOrder(nextOrder);
    this.images.push(image);
    this.ensurePrimaryImage();
    this.touch();
  }

  public setPrimaryImage(imageId: string) {
    this.assertNotDeleted();

    const target = this.images.find((i) => i.getId() === imageId);
    if (!target) throw new Error("Image not found");

    this.images.forEach((img) => img.setPrimary(false));
    target.setPrimary(true);
    this.touch();
  }

  public reorderImages(imageIdsInOrder: string[]) {
    this.assertNotDeleted();

    if (imageIdsInOrder.length !== this.images.length) {
      throw new Error("Invalid image set for reorder");
    }

    const imageMap = new Map(this.images.map((img) => [img.getId(), img]));

    imageIdsInOrder.forEach((id, index) => {
      const img = imageMap.get(id);
      if (!img) {
        throw new Error(`Image not found: ${id}`);
      }
      img.setSortOrder(index);
    });

    this.ensurePrimaryImage();
    this.touch();
  }

  private ensurePrimaryImage() {
    if (this.images.length === 0) return;

    const hasPrimary = this.images.some((i) => i.getIsPrimary());
    if (hasPrimary) return;

    const first = this.images.toSorted((a, b) => a.getSortOrder() - b.getSortOrder())[0];

    first.setPrimary(true);
  }

  private touch() {
    this.updatedAt = new Date();
  }
}
