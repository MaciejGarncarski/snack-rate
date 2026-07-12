import { trace } from "@opentelemetry/api";

import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import {
  cleanupOrphanFiles,
  uploadSnackImages,
  validateSnackImages,
} from "#/features/catalogue/server/services/snack-image.service";
import {
  createSnackRecord,
  type CreateSnackInput,
} from "#/features/catalogue/server/services/snack-record.service";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import { logger } from "#/observability/logger/logger";

const SNACK_STATUS = {
  PENDING: "pending",
  PUBLISHED: "published",
} as const;

const tracer = trace.getTracer("catalogue-service");

export function createSnack(input: CreateSnackInput, snackRepository: SnacksRepository) {
  // TODO: After auth added, check if user is admin, if user is admin, then snack is published, otherwise snack is unpublished and needs to be approved by admin

  const isAdminOrModerator = true;
  const snackStatus = isAdminOrModerator ? SNACK_STATUS.PUBLISHED : SNACK_STATUS.PENDING;

  return tracer.startActiveSpan("createSnack", async (span) => {
    const start = Date.now();

    span.setAttributes({
      "snack.name": input.name,
      "snack.has_barcode": !!input.barcode,
      "snack.image_count": input.images.length,
    });

    try {
      const slug = Slug.create(input.name);

      const dimensions = await validateSnackImages(input.images);
      const uploadedImages = await uploadSnackImages(input.images, slug, dimensions);
      const allUploadedKeys = uploadedImages.flatMap((img) => [img.key, img.thumbKey]);

      let snackId: string;

      try {
        snackId = await createSnackRecord(
          input,
          slug,
          snackStatus,
          uploadedImages,
          snackRepository,
        );
      } catch (err) {
        await cleanupOrphanFiles(allUploadedKeys);
        throw err;
      }

      const duration = Date.now() - start;

      span.setAttributes({
        "snack.id": snackId,
        "createSnack.duration_ms": duration,
        "upload.success_count": uploadedImages.length,
        "upload.total_original_size": uploadedImages.reduce((s, i) => s + i.originalSize, 0),
        "upload.total_optimized_size": uploadedImages.reduce((s, i) => s + i.optimizedSize, 0),
      });

      span.setStatus({ code: 1 });
      return { slug: slug.getValue() };
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
