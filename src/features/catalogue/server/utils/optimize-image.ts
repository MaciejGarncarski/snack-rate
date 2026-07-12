import { Readable } from "node:stream";
import sharp from "sharp";

import {
  MAX_IMAGE_DIMENSION_OUTPUT,
  MAX_IMAGE_MEGAPIXELS,
  OPTIMIZED_FORMAT,
  OPTIMIZED_QUALITY,
} from "#/features/catalogue/create-snack/consts/image-const.ts";

export function optimizeImage(input: ReadableStream<Uint8Array>): {
  stream: ReadableStream<Uint8Array>;
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

  const nodeInput = Readable.fromWeb(
    input as unknown as import("node:stream/web").ReadableStream<Uint8Array>,
  );

  const nodeOutput = nodeInput.pipe(transformer);

  return {
    stream: Readable.toWeb(nodeOutput) as ReadableStream<Uint8Array>,
    ext: OPTIMIZED_FORMAT,
    contentType: `image/${OPTIMIZED_FORMAT}`,
  };
}
