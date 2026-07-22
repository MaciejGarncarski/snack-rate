import { type Readable } from "node:stream";
import sharp from "sharp";

import {
  MAX_IMAGE_MEGAPIXELS,
  OPTIMIZED_FORMAT,
  OPTIMIZED_QUALITY,
  THUMBNAIL_ASPECT_RATIO,
  THUMBNAIL_WIDTH,
} from "@/const/image-const";

export function createThumbnail(
  input: Readable,
  width = THUMBNAIL_WIDTH,
): { stream: Readable; ext: string; contentType: string } {
  const transformer = sharp({
    limitInputPixels: MAX_IMAGE_MEGAPIXELS * 1_000_000,
    sequentialRead: true,
  })
    .rotate()
    .resize({
      width,
      height: Math.round(width / THUMBNAIL_ASPECT_RATIO),
      fit: "cover",
      position: "attention",
      withoutEnlargement: true,
    })
    .toFormat(OPTIMIZED_FORMAT, {
      quality: OPTIMIZED_QUALITY,
    });

  const output = input.pipe(transformer);

  return {
    stream: output,
    ext: OPTIMIZED_FORMAT,
    contentType: `image/${OPTIMIZED_FORMAT}`,
  };
}

export const createThumbnailFromBuffer = async (
  buffer: Buffer,
  width = THUMBNAIL_WIDTH,
): Promise<{ buffer: Buffer; ext: string; contentType: string }> => {
  const transformer = sharp(buffer, {
    limitInputPixels: MAX_IMAGE_MEGAPIXELS * 1_000_000,
    sequentialRead: true,
  })
    .rotate()
    .resize({
      width,
      height: Math.round(width / THUMBNAIL_ASPECT_RATIO),
      fit: "cover",
      position: "attention",
      withoutEnlargement: true,
    })
    .toFormat(OPTIMIZED_FORMAT, {
      quality: OPTIMIZED_QUALITY,
    });

  const outputBuffer = await transformer.toBuffer();

  return {
    buffer: outputBuffer,
    ext: OPTIMIZED_FORMAT,
    contentType: `image/${OPTIMIZED_FORMAT}`,
  };
};
