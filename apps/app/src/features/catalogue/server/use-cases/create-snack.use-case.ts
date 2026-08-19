import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import type { UploadedImage } from "#/features/catalogue/server/services/snack-image.service";
import {
  type CreateSnackInput,
  createSnackRecord,
} from "#/features/catalogue/server/services/snack-record.service";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import type { SnackStatus } from "#/features/shared/value-objects/status.vo.ts";
import type { Database } from "#/infrastructure/db/db";
import { deletePublicFile } from "#/infrastructure/s3-client";
import { snacksCreatedCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { getActiveSpan } from "#/observability/tracing";

export function createSnackUseCase(
  input: CreateSnackInput,
  uploadedImages: UploadedImage[],
  slug: Slug,
  snackRepository: SnacksRepository,
  db: Database,
) {
  const isAdminOrModerator = true;
  const snackStatus: SnackStatus = isAdminOrModerator ? "published" : "pending";

  getActiveSpan()?.setAttributes({
    "snack.name": input.name,
    "snack.has_barcode": !!input.barcode,
    "snack.image_count": uploadedImages.length,
  });

  return (async () => {
    const start = Date.now();

    try {
      const snackId = await createSnackRecord(
        input,
        slug,
        snackStatus,
        uploadedImages,
        snackRepository,
        db,
      );

      const duration = Date.now() - start;

      getActiveSpan()?.setAttributes({
        "snack.id": snackId,
        "createSnack.duration_ms": duration,
        "upload.success_count": uploadedImages.length,
      });

      snacksCreatedCounter.add(1);
      return { slug: slug.getValue() };
    } catch (err) {
      await Promise.allSettled(
        uploadedImages.flatMap(({ key, thumbKey }) => [
          deletePublicFile(key),
          deletePublicFile(thumbKey),
        ]),
      );

      logger.error({ err, snackName: input.name }, "Failed to create snack");
      throw err;
    }
  })();
}
