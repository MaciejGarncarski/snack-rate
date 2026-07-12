import { Readable } from "node:stream";
import sharp from "sharp";

import {
  MAX_IMAGE_MEGAPIXELS,
  OPTIMIZED_FORMAT,
  OPTIMIZED_QUALITY,
  THUMBNAIL_ASPECT_RATIO,
  THUMBNAIL_WIDTH,
} from "#/features/catalogue/create-snack/consts/image-const.ts";

export function createThumbnail(
  input: ReadableStream<Uint8Array>,
  width = THUMBNAIL_WIDTH,
): { stream: ReadableStream<Uint8Array>; ext: string; contentType: string } {
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

  const output = Readable.fromWeb(
    input as unknown as import("node:stream/web").ReadableStream<Uint8Array>,
  ).pipe(transformer);

  return {
    stream: Readable.toWeb(output) as ReadableStream<Uint8Array>,
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
