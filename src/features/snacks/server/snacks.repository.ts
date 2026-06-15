import { sql } from "drizzle-orm";

import type { SnackItemForPersistence } from "#/features/snacks/server/snack-item.mapper";
import { db } from "#/infrastructure/db/db";
import { snackItems, snackItemImages, snackTags, brands } from "#/infrastructure/db/schema";

const MAX_SEARCH_RESULTS = 6;

export const snacksRepository = {
  getBySlug: (slug: string) => {
    return db.query.snackItems.findFirst({
      where: {
        slug: slug,
      },
    });
  },

  list: (limit: number, cursor?: string) => {
    return db.query.snackItems.findMany({
      orderBy: (table, { asc }) => [asc(table.createdAt)],
      limit: limit + 1,
      where: {
        id: { gt: cursor },
      },
      with: {
        brand: true,
        images: true,
        tags: {
          with: {
            tag: true,
          },
          columns: {
            snackItemId: false,
            tagId: false,
          },
        },
      },
    });
  },

  search: (query: string) => {
    return db.query.snackItems.findMany({
      with: {
        images: true,
        brand: true,
        tags: {
          columns: {
            snackItemId: false,
            tagId: false,
          },
          with: { tag: true },
        },
      },
      limit: MAX_SEARCH_RESULTS,
      where: {
        OR: [
          {
            name: {
              ilike: `%${query}%`,
            },
          },
          {
            description: {
              ilike: `%${query}%`,
            },
          },
        ],
      },
    });
  },

  save: (snackItem: SnackItemForPersistence) => {
    return db.transaction(async (tx) => {
      await tx
        .insert(snackItems)
        .values(snackItem.snack)
        .onConflictDoUpdate({
          target: snackItems.id,
          set: {
            ...snackItem.snack,
          },
        });

      if (snackItem.images && snackItem.images.length > 0) {
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

      if (snackItem.tags && snackItem.tags.length > 0) {
        const tagsToInsert = snackItem.tags
          .map((tag) => {
            if (!tag.tag) {
              return null;
            }

            return {
              snackItemId: snackItem.snack.id,
              tagId: tag.tag.id,
            };
          })
          .filter((v): v is NonNullable<typeof v> => !!v);

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

      if (snackItem.brandId) {
        await tx
          .insert(brands)
          .values({
            id: snackItem.brandId,
            name: "",
            createdAt: new Date(),
            updatedAt: new Date(),
            deletedAt: null,
          })
          .onConflictDoUpdate({
            target: brands.id,
            set: {
              name: "",
              updatedAt: new Date(),
              deletedAt: null,
            },
          });
      }
    });
  },
};
