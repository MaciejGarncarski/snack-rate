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

  public static create(params: {
    id: string;
    url: string;
    storageKey: string;
    isPrimary?: boolean;
    sortOrder: number;
  }) {
    return new Image(
      params.id,
      params.url,
      params.storageKey,
      params.isPrimary ?? false,
      params.sortOrder,
      new Date(),
      new Date(),
      null,
    );
  }

  public makePrimary() {
    this.isPrimary = true;
    this.touch();
  }

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

  public touch() {
    this.updatedAt = new Date();
  }

  public makeSecondary() {
    this.isPrimary = false;
    this.touch();
  }

  public setSortOrder(order: number) {
    this.sortOrder = order;
    this.touch();
  }
}
