import { trace } from "@opentelemetry/api";

import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { getExtensionFromBlob } from "#/features/catalogue/utils/get-extension-from-blob.ts";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";
import { uploadPrivateFile } from "#/infrastructure/s3-client";
import { logger } from "#/observability/logger/logger";

type CreateSnackInput = {
  name: string;
  description?: string;
  price?: number;
  barcode?: string;
  typeSlug: string;
  images: Blob[];
};

const ALLOWED_MIME_TYPES = new Set(["image/jpeg", "image/jpg", "image/png", "image/webp"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const tracer = trace.getTracer("catalogue-service");

function validateImage(img: Blob, index: number): void {
  if (!ALLOWED_MIME_TYPES.has(img.type)) {
    throw new Error(`Image ${index}: unsupported type "${img.type}". Allowed: jpg, png, webp`);
  }

  if (img.size > MAX_FILE_SIZE) {
    throw new Error(
      `Image ${index}: file too large (${(img.size / 1024 / 1024).toFixed(1)} MB). Max: 10 MB`,
    );
  }
}

export function createSnack(input: CreateSnackInput, snackRepository: SnacksRepository) {
  // TODO: After auth added, check if user is admin, if user is admin, then snack is published, otherwise snack is unpublished and needs to be approved by admin

  const isAdminOrModerator = true; // TODO: Replace with actual check
  const snackStatus = isAdminOrModerator ? "published" : "pending";

  return tracer.startActiveSpan("createSnack", async (span) => {
    const start = Date.now();

    span.setAttributes({
      "snack.name": input.name,
      "snack.price": input.price,
      "snack.barcode": input.barcode ?? "",
      "snack.image_count": input.images.length,
    });

    try {
      const slug = Slug.create(input.name);

      for (const [index, img] of input.images.entries()) {
        validateImage(img, index);
      }

      const uploadedKeys = await Promise.all(
        input.images.map((img, index) => {
          return tracer.startActiveSpan("uploadSnackImage", async (imgSpan) => {
            const imgStart = Date.now();

            try {
              const ext = getExtensionFromBlob(img);
              const key = StorageKey.create(slug, ext).getValue();

              imgSpan.setAttributes({
                "image.index": index,
                "image.extension": ext,
                "s3.key": key,
              });

              const buffer = Buffer.from(await img.arrayBuffer());

              await uploadPrivateFile(key, buffer);

              const duration = Date.now() - imgStart;

              imgSpan.setStatus({ code: 1 });
              imgSpan.setAttributes({
                "upload.duration_ms": duration,
              });

              return { key, index };
            } finally {
              imgSpan.end();
            }
          });
        }),
      );

      const snackId = await snackRepository.transaction(async (tx) => {
        const snack = await snackRepository.create(
          {
            name: input.name,
            slug: slug.getValue(),
            description: input.description,
            price: input.price,
            barcode: input.barcode,
            typeSlug: input.typeSlug,
            status: snackStatus,
          },
          tx,
        );

        for (const uploaded of uploadedKeys) {
          await snackRepository.addImage(
            {
              snackItemId: snack.id,
              storageKey: uploaded.key,
              sortOrder: uploaded.index,
              isPrimary: uploaded.index === 0,
            },
            tx,
          );
        }

        return snack.id;
      });

      const duration = Date.now() - start;

      span.setAttributes({
        "createSnack.duration_ms": duration,
        "createSnack.snack_id": snackId,
        "upload.success_count": uploadedKeys.length,
      });

      span.setStatus({ code: 1 });
      return { snackId };
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2 });
      logger.error({ err, snackName: input.name }, "Failed to create snack");
      throw err;
    } finally {
      span.end();
    }
  });
}
