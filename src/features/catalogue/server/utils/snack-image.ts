import sharp from "sharp";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const ALLOWED_INPUT_FORMATS = new Set(["jpeg", "png", "webp", "tiff", "avif"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const MAX_IMAGE_MEGAPIXELS = 12;
const MAX_IMAGE_DIMENSION = 4096;
const OPTIMIZED_FORMAT = "webp";
const OPTIMIZED_QUALITY = 85;
const MAX_IMAGE_DIMENSION_OUTPUT = 1200;
const THUMBNAIL_WIDTH = 120;
const THUMNAIL_ASPECT_RATIO = 4 / 5;

export function validateImage(img: Blob, index: number): void {
  if (!ALLOWED_MIME_TYPES.has(img.type)) {
    throw new Error(`Image ${index}: unsupported type "${img.type}". Allowed: jpg, png, webp`);
  }

  if (img.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image ${index}: file too large (${(img.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB`,
    );
  }
}

export async function validateImageDimensions(
  img: Blob,
  index: number,
): Promise<{ width: number; height: number }> {
  const buffer = Buffer.from(await img.arrayBuffer());
  const metadata = await sharp(buffer, {
    limitInputPixels: MAX_IMAGE_MEGAPIXELS * 1_000_000,
    sequentialRead: true,
  }).metadata();

  const width = metadata.width ?? 0;
  const height = metadata.height ?? 0;
  const megapixels = (width * height) / 1_000_000;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    throw new Error(
      `Image ${index}: dimensions (${width}x${height}) exceed max ${MAX_IMAGE_DIMENSION}px`,
    );
  }

  if (megapixels > MAX_IMAGE_MEGAPIXELS) {
    throw new Error(
      `Image ${index}: ${megapixels.toFixed(1)} MP exceeds max ${MAX_IMAGE_MEGAPIXELS} MP`,
    );
  }

  if (metadata.format && !ALLOWED_INPUT_FORMATS.has(metadata.format)) {
    throw new Error(
      `Image ${index}: unsupported format "${metadata.format}". Allowed: ${Array.from(ALLOWED_INPUT_FORMATS).join(", ")}`,
    );
  }

  return { width, height };
}

export async function optimizeImage(input: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  const optimized = await sharp(input, {
    limitInputPixels: MAX_IMAGE_MEGAPIXELS * 1_000_000,
    sequentialRead: true,
  })
    .rotate()
    .resize({
      width: MAX_IMAGE_DIMENSION_OUTPUT,
      height: MAX_IMAGE_DIMENSION_OUTPUT,
      fit: "inside",
      withoutEnlargement: true,
    })
    .toFormat(OPTIMIZED_FORMAT, { quality: OPTIMIZED_QUALITY })
    .toBuffer();

  return { buffer: optimized, ext: OPTIMIZED_FORMAT };
}

export function createThumbnail(
  buffer: Buffer,
  ext: string,
  width = THUMBNAIL_WIDTH,
): Promise<Buffer> {
  const sharpInstance = sharp(buffer, {
    limitInputPixels: MAX_IMAGE_MEGAPIXELS * 1_000_000,
  });

  let pipeline = sharpInstance.resize({
    width: width,
    height: Math.round(width / THUMNAIL_ASPECT_RATIO),
    fit: "cover",
    position: "entropy",
  });

  switch (ext) {
    case "jpg":
    case "jpeg":
      pipeline = pipeline.jpeg({ quality: OPTIMIZED_QUALITY });
      break;
    case "png":
      pipeline = pipeline.png();
      break;
    case "webp":
      pipeline = pipeline.webp({ quality: OPTIMIZED_QUALITY });
      break;
    default:
      pipeline = pipeline.png();
  }

  return pipeline.toBuffer();
}
