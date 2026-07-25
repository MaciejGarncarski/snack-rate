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
export const THUMBNAIL_WIDTH = 100;
export const THUMBNAIL_ASPECT_RATIO = 4 / 5;

export const OUTPUT_ASPECT_RATIO = 4 / 5;

/*
  Images with aspect ratio more than EXTREME_THRESHOLD away from the
  target 4:5 lose too much content when force-cropped (e.g. a 200x1000px
  phone-booth shot crops down to ~160x200).  These get the pad flow
  instead: the source is centred and letterboxed into a 4:5 canvas.
*/
export const EXTREME_THRESHOLD = 2.5;

export const PAD_OUTPUT_WIDTH = 1024;
export const PAD_OUTPUT_HEIGHT = Math.round(PAD_OUTPUT_WIDTH / OUTPUT_ASPECT_RATIO); // 1280
