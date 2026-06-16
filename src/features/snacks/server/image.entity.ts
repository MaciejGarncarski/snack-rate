// TODO: add validation + tests

import { ImgUrl } from "#/features/snacks/server/value-objects/img-url.vo";
import { SortOrder } from "#/features/snacks/server/value-objects/sort-order.vo";
import { StorageKey } from "#/features/snacks/server/value-objects/storage-key.vo";

export class Image {
  private constructor(
    private readonly id: string,
    private url: ImgUrl,
    private storageKey: StorageKey,
    private isPrimary: boolean,
    private sortOrder: SortOrder,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  public static create(params: {
    id: string;
    url: string;
    storageKey: string;
    isPrimary?: boolean;
    sortOrder: number;
  }) {
    if (!params.id) throw new Error("Image id is required");

    return new Image(
      params.id,
      ImgUrl.create(params.url),
      StorageKey.create(params.storageKey),
      params.isPrimary ?? false,
      SortOrder.create(params.sortOrder),
      new Date(),
      new Date(),
      null,
    );
  }

  public static fromPersistence(data: {
    id: string;
    url: string;
    storageKey: string;
    isPrimary: boolean;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }) {
    return new Image(
      data.id,
      ImgUrl.create(data.url),
      StorageKey.create(data.storageKey),
      data.isPrimary,
      SortOrder.create(data.sortOrder),
      data.createdAt,
      data.updatedAt,
      data.deletedAt,
    );
  }

  public setPrimary(isPrimary: boolean) {
    this.assertNotDeleted();
    this.isPrimary = isPrimary;
    this.touch();
  }

  public setSortOrder(order: number) {
    this.assertNotDeleted();
    this.sortOrder = SortOrder.create(order);
    this.touch();
  }

  public markDeleted() {
    this.deletedAt = new Date();
    this.touch();
  }

  private assertNotDeleted() {
    if (this.deletedAt) {
      throw new Error("Cannot modify a deleted image");
    }
  }

  private touch() {
    this.updatedAt = new Date();
  }

  public getId() {
    return this.id;
  }

  public getUrl() {
    return this.url.toString();
  }

  public getStorageKey() {
    return this.storageKey.toString();
  }

  public getIsPrimary() {
    return this.isPrimary;
  }

  public getSortOrder() {
    return this.sortOrder.valueOf();
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
}
