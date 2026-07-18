export const MAXIMUM_IMAGES = 3;

export const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/avif",
]);
export const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "png", "webp", "avif"]);
export const supportedFormatsList = Array.from(ALLOWED_INPUT_FORMATS).join(", ");

export const MAX_FILE_SIZE = 10 * 1024 * 1024;
export const MAX_IMAGE_MEGAPIXELS = 12;
export const MAX_IMAGE_DIMENSION = 4096;
export const OPTIMIZED_FORMAT = "webp";
export const OPTIMIZED_QUALITY = 85;
export const MAX_IMAGE_DIMENSION_OUTPUT = 1200;
export const THUMBNAIL_WIDTH = 120;
export const THUMBNAIL_ASPECT_RATIO = 4 / 5;
