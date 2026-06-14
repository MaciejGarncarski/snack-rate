import type { ImageEntity } from "#/features/snacks/server/image.entity";
import type { Price } from "#/features/snacks/server/value-objects/price.vo";
import type { Rating } from "#/features/snacks/server/value-objects/rating.vo";
import type { Slug } from "#/features/snacks/server/value-objects/slug.vo";

export class SnackAggregate {
  constructor(
    private id: string,
    private _name: string,
    private _description: string,
    private _price: Price,
    private _images: ImageEntity[],
    private _createdAt: Date,
    private _updatedAt: Date,
    private _deletedAt: Date | null,
    private _brandId: string | null,
    private _snackTags: string[], // TODO: change to value object
    private _slug: Slug,
    private _barcode: string | null,
    private _avgRating: Rating,
  ) {}

  get name() {
    return this._name;
  }

  get description() {
    return this._description;
  }

  get price() {
    return this._price;
  }

  get images() {
    return [...this._images];
  }

  get primaryImage() {
    return this._images.find((img) => img.isPrimary) ?? null;
  }

  get createdAt() {
    return this._createdAt;
  }

  get updatedAt() {
    return this._updatedAt;
  }

  get deletedAt() {
    return this._deletedAt;
  }

  get brand() {
    return this._brandId;
  }

  touch() {
    this._updatedAt = new Date();
  }
}
