export const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const supportedFormatsList = SUPPORTED_FORMATS.map((type) =>
  type.split("/")[1].toUpperCase(),
).join(", ");
export type AcceptedImageType = (typeof supportedFormatsList)[number];
export const IMAGE_TOAST_TIMEOUT = 5000;
export const MAXIMUM_IMAGES = 3;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
