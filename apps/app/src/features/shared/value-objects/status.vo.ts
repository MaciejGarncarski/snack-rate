const STATUSES = ["pending", "published", "rejected"] as const;
export type SnackStatus = (typeof STATUSES)[number];

export class Status {
  private constructor(private readonly value: SnackStatus) {}

  static create(value: string): Status {
    // SAFETY: the includes() check below guarantees value is a member of STATUSES.
    if (!STATUSES.includes(value as SnackStatus)) {
      throw new Error(`Invalid status: ${value}. Must be one of: ${STATUSES.join(", ")}`);
    }

    // SAFETY: guarded by the includes() check above.
    return new Status(value as SnackStatus);
  }

  getValue(): SnackStatus {
    return this.value;
  }

  isPublished(): boolean {
    return this.value === "published";
  }
}
