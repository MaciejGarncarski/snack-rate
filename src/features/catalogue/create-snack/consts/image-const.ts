export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const supportedFormatsList = SUPPORTED_FORMATS.map((type) =>
  type.split("/")[1].toUpperCase(),
).join(", ");
export type AcceptedImageType = (typeof supportedFormatsList)[number];
export const IMAGE_TOAST_TIMEOUT = 5000;
