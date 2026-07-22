import type { CatalogueErrorCode } from "@/features/catalogue/server/errors/catalogue-errors";

export type DomainErrorCode = CatalogueErrorCode;

export class DomainError<T extends DomainErrorCode = DomainErrorCode> extends Error {
  public readonly name = "DomainError";

  constructor(
    public readonly type: T,
    public readonly context: Record<string, unknown> = {},
    options?: { cause?: unknown },
  ) {
    super(DomainError.buildMessage(type, context), options);

    Object.setPrototypeOf(this, new.target.prototype);
  }

  private static buildMessage(type: DomainErrorCode, context: Record<string, unknown>): string {
    switch (type) {
      case "SNACK_NOT_FOUND":
        return `SNACK_NOT_FOUND${context?.id ? ` (id=${context.id})` : ""}`;

      case "SNACK_ALREADY_EXISTS":
        return `SNACK_ALREADY_EXISTS (name=${context.name})`;

      case "INVALID_SNACK_DATA":
        return `INVALID_SNACK_DATA${context?.field ? ` (field=${context.field})` : ""}`;

      default:
        return type;
    }
  }

  toJSON() {
    return {
      name: this.name,
      type: this.type,
      context: this.context,
      message: this.message,
    };
  }
}
