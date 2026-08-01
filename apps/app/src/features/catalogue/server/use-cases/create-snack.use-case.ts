import pLimit from "p-limit";

import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import type { UploadedImage } from "#/features/catalogue/server/services/snack-image.service";
import {
  type CreateSnackInput,
  createSnackRecord,
} from "#/features/catalogue/server/services/snack-record.service";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import type { SnackStatus } from "#/features/shared/value-objects/status.vo.ts";
import { StorageKey } from "#/features/shared/value-objects/storage-key.vo";
import type { Database } from "#/infrastructure/db/db";
import { copyPublicFile, deletePublicFile } from "#/infrastructure/s3-client";
import { snacksCreatedCounter } from "#/observability/counters";
import { logger } from "#/observability/logger/logger";
import { getTracer, markSpanOk, startActiveSpan } from "#/observability/tracing";

const UPLOAD_CONCURRENCY = 3;

export function createSnackUseCase(
  input: CreateSnackInput,
  snackRepository: SnacksRepository,
  db: Database,
) {
  const isAdminOrModerator = true;
  const snackStatus: SnackStatus = isAdminOrModerator ? "published" : "pending";

  return startActiveSpan(
    "createSnack",
    async (span) => {
      const start = Date.now();

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
          db,
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

        markSpanOk(span);
        snacksCreatedCounter.add(1);
        return { slug: slug.getValue() };
      } catch (err) {
        await Promise.allSettled(uploadedKeys.map((key) => deletePublicFile(key)));
        await Promise.allSettled(
          input.images.flatMap(({ key, thumbKey }) => [
            deletePublicFile(key),
            deletePublicFile(thumbKey),
          ]),
        );

        logger.error({ err, snackName: input.name }, "Failed to create snack");
        throw err;
      }
    },
    {
      tracer: getTracer("catalogue-service"),
      attributes: {
        "snack.name": input.name,
        "snack.has_barcode": !!input.barcode,
        "snack.image_count": input.images.length,
      },
    },
  );
}
