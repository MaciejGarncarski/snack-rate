export const catalogueErrors = {
  SNACK_NOT_FOUND: "SNACK_NOT_FOUND",
  SNACK_ALREADY_EXISTS: "SNACK_ALREADY_EXISTS",
  INVALID_SNACK_DATA: "INVALID_SNACK_DATA",
  VALIDATION_ERROR: "VALIDATION_ERROR",
} as const;

export type CatalogueErrorCode = (typeof catalogueErrors)[keyof typeof catalogueErrors];
