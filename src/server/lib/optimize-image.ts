import { type Readable } from "node:stream";
import sharp from "sharp";

import {
  MAX_IMAGE_DIMENSION_OUTPUT,
  MAX_IMAGE_MEGAPIXELS,
  OPTIMIZED_FORMAT,
  OPTIMIZED_QUALITY,
} from "#/const/image-const";

export function optimizeImage(input: Readable): {
  stream: Readable;
  ext: string;
  contentType: string;
} {
  const transformer = sharp({
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
