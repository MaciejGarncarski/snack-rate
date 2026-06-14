export class ImageEntity {
  constructor(
    public readonly id: string,
    public readonly storageKey: string,
    public isPrimary: boolean,
    public sortOrder: number,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}
}
