import { trace } from "@opentelemetry/api";
import pLimit from "p-limit";

import {
  createThumbnail,
  optimizeImage,
  validateImage,
  validateImageDimensions,
} from "#/features/catalogue/server/utils/snack-image";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";
import { deletePublicFile, uploadPublicFile } from "#/infrastructure/s3-client";
import { exponentialBackoff } from "#/lib/exponential-backoff";
import { logger } from "#/observability/logger/logger";

const UPLOAD_CONCURRENCY = 3;

const tracer = trace.getTracer("catalogue-service");

export type UploadedImage = {
  key: string;
  thumbKey: string;
  index: number;
  originalSize: number;
  optimizedSize: number;
  width: number;
  height: number;
  processingTime: number;
};

export function validateSnackImages(images: Blob[]): Promise<{ width: number; height: number }[]> {
  for (const [index, img] of images.entries()) {
    validateImage(img, index);
  }

  return Promise.all(images.map((img, index) => validateImageDimensions(img, index)));
}

export function uploadSnackImages(
  images: Blob[],
  slug: Slug,
  dimensions: { width: number; height: number }[],
): Promise<UploadedImage[]> {
  const limit = pLimit(UPLOAD_CONCURRENCY);

  const tasks = images.map((img, index) =>
    limit(() => {
      return tracer.startActiveSpan("uploadSnackImage", async (imgSpan) => {
        const imgStart = Date.now();

        try {
          const buffer = Buffer.from(await img.arrayBuffer());
          const { buffer: optimized, ext } = await optimizeImage(buffer);

          const key = StorageKey.create(slug, ext).getValue();
          const thumbKey = StorageKey.createThumb(slug, ext).getValue();

          const thumb = await createThumbnail(optimized, ext);
          const { width, height } = dimensions[index];

          await Promise.all([
            exponentialBackoff(() => uploadPublicFile(key, optimized), {
              retries: 3,
              minTimeout: 1000,
              factor: 2,
              fnName: "uploadOriginal",
              logger,
            }),
            exponentialBackoff(() => uploadPublicFile(thumbKey, thumb), {
              retries: 3,
              minTimeout: 1000,
              factor: 2,
              fnName: "uploadThumbnail",
              logger,
            }),
          ]);

          const duration = Date.now() - imgStart;

          imgSpan.setAttributes({
            "image.index": index,
            "image.extension": ext,
            "image.original_size": img.size,
            "image.optimized_size": optimized.length,
            "image.compression_ratio": Number((optimized.length / img.size).toFixed(3)),
            "image.output_width": 1200,
            "image.output_format": ext,
            "s3.key": key,
            "s3.thumb_key": thumbKey,
            "upload.duration_ms": duration,
          });

          imgSpan.setStatus({ code: 1 });

          return {
            key,
            thumbKey,
            index,
            originalSize: img.size,
            optimizedSize: optimized.length,
            width,
            height,
            processingTime: duration,
          };
        } finally {
          imgSpan.end();
        }
      });
    }),
  );

  return Promise.all(tasks);
}

export async function cleanupOrphanFiles(keys: string[]): Promise<void> {
  if (keys.length === 0) return;

  await Promise.all(
    keys.map((key) =>
      exponentialBackoff(() => deletePublicFile(key), {
        retries: 2,
        minTimeout: 500,
        factor: 2,
        fnName: "cleanupOrphanFile",
        logger,
      }).catch((err) => {
        logger.warn({ err, s3key: key }, "Failed to clean up orphan S3 file");
      }),
    ),
  );
}
