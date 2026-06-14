export class Image {
  constructor(
    private id: string,
    private url: string,
    private storageKey: string,
    private isPrimary: boolean,
    private sortOrder: number,
    private createdAt: Date,
    private updatedAt: Date,
    private deletedAt: Date | null,
  ) {}

  public getId() {
    return this.id;
  }

  public getUrl() {
    return this.url;
  }

  public getIsPrimary() {
    return this.isPrimary;
  }

  public getSortOrder() {
    return this.sortOrder;
  }

  public getStorageKey() {
    return this.storageKey;
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
