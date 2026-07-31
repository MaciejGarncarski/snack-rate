import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import type { UploadedImage } from "#/features/catalogue/server/services/snack-image.service";
import { Slug } from "#/features/shared/value-objects/slug.vo";
import type { SnackStatus } from "#/features/shared/value-objects/status.vo";
import { type Database } from "#/infrastructure/db/db";

export type CreateSnackInput = {
  name: string;
  description?: string;
  barcode?: string;
  typeSlug: string;
  images: { key: string; thumbKey: string; filename: string; fileExt: string }[];
};

export function createSnackRecord(
  input: CreateSnackInput,
  slug: Slug,
  status: SnackStatus,
  uploadedImages: UploadedImage[],
  snackRepository: SnacksRepository,
  db: Database,
): Promise<string> {
  return db.transaction(async (tx) => {
    const snack = await snackRepository.create(
      {
        name: input.name,
        slug: slug.getValue(),
        description: input.description,
        barcode: input.barcode,
        typeSlug: input.typeSlug,
        status,
      },
      tx,
    );

    for (const uploaded of uploadedImages) {
      await snackRepository.addImage(
        {
          snackItemId: snack.id,
          storageKey: uploaded.key,
          type: "default",
          sortOrder: uploaded.index,
        },
        tx,
      );

      await snackRepository.addImage(
        {
          snackItemId: snack.id,
          storageKey: uploaded.thumbKey,
          type: "thumbnail",
          sortOrder: uploaded.index,
        },
        tx,
      );
    }

    return snack.id;
  });
}
