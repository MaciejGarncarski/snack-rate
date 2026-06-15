import { sql } from "drizzle-orm";

import type { SnackItemForPersistence } from "#/features/snacks/server/snack-item.mapper";
import { snackMapper } from "#/features/snacks/server/snack-item.mapper";
import { db } from "#/infrastructure/db/db";
import { snackItems, snackItemImages, snackTags } from "#/infrastructure/db/schema";
import { getPrivateFileUrl } from "#/infrastructure/s3-client";

const MAX_SEARCH_RESULTS = 6;

async function resolveImageUrls<T extends { images: { storageKey: string }[] }>(
  row: T,
): Promise<T & { images: (T["images"][number] & { url: string })[] }> {
  const images = await Promise.all(
    row.images.map(async (img) => ({
      ...img,
      url: await getPrivateFileUrl(img.storageKey),
    })),
  );
  return { ...row, images };
}

export const snacksRepository = {
  getBySlug: async (slug: string) => {
    const foundSnack = await db.query.snackItems.findFirst({
      where: { slug },
      with: {
        brand: true,
        images: true,
        tags: {
          with: { tag: true },
          columns: { snackItemId: false, tagId: false },
        },
      },
    });

    if (!foundSnack) return null;

    const resolved = await resolveImageUrls(foundSnack);
    return snackMapper.toDomain(resolved);
  },

  list: async (limit: number, cursor?: string) => {
    const rows = await db.query.snackItems.findMany({
      orderBy: (table, { desc }) => [desc(table.id)],
      limit,
      where: cursor ? { id: { lt: cursor } } : undefined,
      with: {
        brand: true,
        images: true,
        tags: {
          with: { tag: true },
          columns: { snackItemId: false, tagId: false },
        },
      },
    });

    const resolved = await Promise.all(rows.map((row) => resolveImageUrls(row)));
    return resolved.map((row) => snackMapper.toDomain(row));
  },

  search: async (query: string) => {
    const rows = await db.query.snackItems.findMany({
      with: {
        images: true,
        brand: true,
        tags: {
          columns: { snackItemId: false, tagId: false },
          with: { tag: true },
        },
      },
      limit: MAX_SEARCH_RESULTS,
      where: {
        OR: [{ name: { ilike: `%${query}%` } }, { description: { ilike: `%${query}%` } }],
      },
    });

    const resolved = await Promise.all(rows.map(resolveImageUrls));
    return resolved.map((row) => snackMapper.toDomain(row));
  },

  save: (snackItem: SnackItemForPersistence) => {
    return db.transaction(async (tx) => {
      await tx
        .insert(snackItems)
        .values(snackItem.snack)
        .onConflictDoUpdate({
          target: snackItems.id,
          set: { ...snackItem.snack },
        });

      if (snackItem.images.length > 0) {
        const imagesToInsert = snackItem.images.map((image) => ({
          ...image,
          snackItemId: snackItem.snack.id,
        }));

        await tx
          .insert(snackItemImages)
          .values(imagesToInsert)
          .onConflictDoUpdate({
            target: snackItemImages.id,
            set: {
              createdAt: sql.raw(`excluded.${snackItemImages.createdAt}`),
              updatedAt: new Date(),
              deletedAt: sql.raw(`excluded.${snackItemImages.deletedAt}`),
              id: sql.raw(`excluded.${snackItemImages.id}`),
              snackItemId: sql.raw(`excluded.${snackItemImages.snackItemId}`),
              isPrimary: sql.raw(`excluded.${snackItemImages.isPrimary}`),
              sortOrder: sql.raw(`excluded.${snackItemImages.sortOrder}`),
              storageKey: sql.raw(`excluded.${snackItemImages.storageKey}`),
            },
          });
      }

      if (snackItem.tags.length > 0) {
        const tagsToInsert = snackItem.tags.flatMap((tag) =>
          tag.tag ? [{ snackItemId: snackItem.snack.id, tagId: tag.tag.id }] : [],
        );
        
        await tx
          .insert(snackTags)
          .values(tagsToInsert)
          .onConflictDoUpdate({
            target: snackTags.tagId,
            set: {
              snackItemId: snackItem.snack.id,
              tagId: sql.raw(`excluded.${snackTags.tagId}`),
            },
          });
      }
    });
  },
};
