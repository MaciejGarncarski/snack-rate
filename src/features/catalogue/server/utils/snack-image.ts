import sharp from "sharp";

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const OPTIMIZED_FORMAT = "webp";
const OPTIMIZED_QUALITY = 85;
const MAX_IMAGE_DIMENSION = 1200;
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

export async function optimizeImage(buffer: Buffer): Promise<{ buffer: Buffer; ext: string }> {
  const optimized = await sharp(buffer)
    .resize({
      width: MAX_IMAGE_DIMENSION,
      height: MAX_IMAGE_DIMENSION,
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
  const sharpInstance = sharp(buffer);

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
