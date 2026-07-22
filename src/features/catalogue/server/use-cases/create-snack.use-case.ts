import { trace } from "@opentelemetry/api";
import pLimit from "p-limit";

import type { SnacksRepository } from "@/features/catalogue/server/repositories/snacks.repository";
import type { UploadedImage } from "@/features/catalogue/server/services/snack-image.service";
import {
  type CreateSnackInput,
  createSnackRecord,
} from "@/features/catalogue/server/services/snack-record.service";
import { Slug } from "@/features/shared/value-objects/slug.vo";
import type { SnackStatus } from "@/features/shared/value-objects/status.vo.ts";
import { StorageKey } from "@/features/shared/value-objects/storage-key.vo";
import { copyPublicFile, deletePublicFile } from "@/infrastructure/s3-client";
import { logger } from "@/observability/logger/logger";

const UPLOAD_CONCURRENCY = 3;

const tracer = trace.getTracer("catalogue-service");

export function createSnack(input: CreateSnackInput, snackRepository: SnacksRepository) {
  const isAdminOrModerator = true;
  const snackStatus: SnackStatus = isAdminOrModerator ? "published" : "pending";

  return tracer.startActiveSpan("createSnack", async (span) => {
    const start = Date.now();

    span.setAttributes({
      "snack.name": input.name,
      "snack.has_barcode": !!input.barcode,
      "snack.image_count": input.images.length,
    });

    const uploadedKeys: string[] = [];
    const limit = pLimit(UPLOAD_CONCURRENCY);

    try {
      const slug = Slug.create(input.name);
      const uploadedImages: UploadedImage[] = [];

      await Promise.all(
        input.images.map(({ key, thumbKey, fileExt }, index) =>
          limit(async () => {
            const permImageKey = StorageKey.create(slug, fileExt).getValue();
            const permThumbKey = StorageKey.createThumb(slug, fileExt).getValue();

            await Promise.all([
              copyPublicFile(key, permImageKey),
              copyPublicFile(thumbKey, permThumbKey),
            ]);

            uploadedKeys.push(permImageKey, permThumbKey);
            uploadedImages.push({ key: permImageKey, thumbKey: permThumbKey, index });
          }),
        ),
      );

      const snackId = await createSnackRecord(
        input,
        slug,
        snackStatus,
        uploadedImages,
        snackRepository,
      );

      await Promise.allSettled(
        input.images.flatMap(({ key, thumbKey }) => [
          deletePublicFile(key),
          deletePublicFile(thumbKey),
        ]),
      );

      const duration = Date.now() - start;

      span.setAttributes({
        "snack.id": snackId,
        "createSnack.duration_ms": duration,
        "upload.success_count": input.images.length,
      });

      span.setStatus({ code: 1 });
      return { slug: slug.getValue() };
    } catch (err) {
      span.recordException(err as Error);
      span.setStatus({ code: 2 });

      await Promise.allSettled(uploadedKeys.map((key) => deletePublicFile(key)));
      await Promise.allSettled(
        input.images.flatMap(({ key, thumbKey }) => [
          deletePublicFile(key),
          deletePublicFile(thumbKey),
        ]),
      );

      logger.error({ err, snackName: input.name }, "Failed to create snack");
      throw err;
    } finally {
      span.end();
    }
  });
}
