import { snackItemImages, snackItems } from "@snack-rate/db-schema/schema";
import { and, eq, isNull } from "drizzle-orm";

import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type AdminSnackDetail = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  barcode: string | null;
  status: string;
  typeId: string;
  typeName: string;
  authorName: string | null;
  avgRating: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
  images: {
    id: string;
    url: string;
    storageKey: string;
    sortOrder: number;
    type: string;
  }[];
};

export type UpdateSnackInput = {
  snackItemId: string;
  name: string;
  description: string | null;
  typeId: string;
};

export type UpdateSnackResult =
  | { status: "ok"; snack: AdminSnackDetail }
  | { status: "not-found" }
  | { status: "unknown-type" };

/**
 * Reassigns sort orders without in-place collisions: parks every affected
 * group in negative temp space first, then assigns final positions.
 */
async function applySortMapping(
  tx: DbTransaction,
  snackItemId: string,
  newSortByOldSort: Map<number, number>,
): Promise<void> {
  for (const oldSort of newSortByOldSort.keys()) {
    await tx
      .update(snackItemImages)
      .set({ sortOrder: -(oldSort + 1) })
      .where(
        and(
          eq(snackItemImages.snackItemId, snackItemId),
          eq(snackItemImages.sortOrder, oldSort),
          isNull(snackItemImages.deletedAt),
        ),
      );
  }
  for (const [oldSort, newSort] of newSortByOldSort) {
    await tx
      .update(snackItemImages)
      .set({ sortOrder: newSort })
      .where(
        and(
          eq(snackItemImages.snackItemId, snackItemId),
          eq(snackItemImages.sortOrder, -(oldSort + 1)),
          isNull(snackItemImages.deletedAt),
        ),
      );
  }
}

async function toSnackDetail(
  row: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    barcode: string | null;
    status: string;
    typeId: string;
    avgRating: string;
    ratingCount: number;
    createdAt: Date;
    updatedAt: Date;
    type: { name: string } | null;
    author: { name: string } | null;
    images: { id: string; storageKey: string; sortOrder: number; type: string }[];
  },
  getFileUrl: (storageKey: string) => Promise<string>,
): Promise<AdminSnackDetail> {
  const images = (
    await Promise.all(
      row.images.map(async (img) => ({
        id: img.id,
        url: await getFileUrl(img.storageKey),
        storageKey: img.storageKey,
        sortOrder: img.sortOrder,
        type: img.type,
      })),
    )
  ).toSorted((a, b) => a.sortOrder - b.sortOrder || (a.id < b.id ? -1 : 1));
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    barcode: row.barcode,
    status: row.status,
    typeId: row.typeId,
    typeName: row.type?.name ?? "",
    authorName: row.author?.name?.trim() || null,
    avgRating: Number(row.avgRating),
    ratingCount: row.ratingCount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    images,
  };
}

export function createAdminSnacksRepository({
  db,
  getFileUrl,
  deleteFile,
}: {
  db: Database;
  getFileUrl: (storageKey: string) => Promise<string>;
  deleteFile: (storageKey: string) => Promise<void>;
}) {
  function findSnackDetailRow(snackItemId: string) {
    return db.query.snackItems.findFirst({
      where: { id: snackItemId, deletedAt: { isNull: true } },
      with: {
        type: { columns: { name: true } },
        images: {
          where: { deletedAt: { isNull: true } },
          columns: { id: true, storageKey: true, sortOrder: true, type: true },
        },
        author: { columns: { name: true } },
      },
    });
  }

  return {
    getSnack: async (snackItemId: string): Promise<AdminSnackDetail | null> => {
      const row = await findSnackDetailRow(snackItemId);
      if (!row) return null;
      return toSnackDetail(row, getFileUrl);
    },

    updateSnack: async (input: UpdateSnackInput): Promise<UpdateSnackResult> => {
      const type = await db.query.snackTypes.findFirst({
        where: { id: input.typeId },
        columns: { id: true },
      });
      if (!type) return { status: "unknown-type" };

      const [updated] = await db
        .update(snackItems)
        .set({
          name: input.name,
          description: input.description,
          typeId: input.typeId,
          updatedAt: new Date(),
        })
        .where(and(eq(snackItems.id, input.snackItemId), isNull(snackItems.deletedAt)))
        .returning({ id: snackItems.id });

      if (!updated) return { status: "not-found" };

      const snack = await findSnackDetailRow(input.snackItemId);
      if (!snack) return { status: "not-found" };

      return { status: "ok", snack: await toSnackDetail(snack, getFileUrl) };
    },

    reorderSnackImages: async (
      snackItemId: string,
      orderedImageIds: string[],
    ): Promise<boolean> => {
      const rows = await db.query.snackItemImages.findMany({
        where: {
          AND: [{ snackItemId }, { deletedAt: { isNull: true } }],
        },
        columns: { id: true, type: true, sortOrder: true },
      });

      const currentDefaultIds = rows
        .filter((row) => row.type === "default")
        .map((row) => row.id)
        .toSorted();
      const sortedInput = [...orderedImageIds].toSorted();
      const matches =
        sortedInput.length === currentDefaultIds.length &&
        sortedInput.every((id, index) => id === currentDefaultIds[index]);
      if (!matches) return false;

      const sortById = new Map(
        rows.filter((row) => row.type === "default").map((row) => [row.id, row.sortOrder] as const),
      );
      const newSortByOldSort = new Map<number, number>();
      for (const [position, imageId] of orderedImageIds.entries()) {
        const oldSort = sortById.get(imageId);
        if (oldSort === undefined) return false;
        if (!newSortByOldSort.has(oldSort)) newSortByOldSort.set(oldSort, position);
      }

      await db.transaction(async (tx) => {
        await applySortMapping(tx, snackItemId, newSortByOldSort);
      });

      return true;
    },

    deleteSnackImage: async (
      snackItemId: string,
      imageId: string,
    ): Promise<{ deletedKeys: string[] } | null> => {
      const target = await db.query.snackItemImages.findFirst({
        where: {
          AND: [
            { id: imageId },
            { snackItemId },
            { type: "default" },
            { deletedAt: { isNull: true } },
          ],
        },
        columns: { id: true, sortOrder: true },
      });
      if (!target) return null;

      const group = await db.query.snackItemImages.findMany({
        where: {
          AND: [{ snackItemId }, { sortOrder: target.sortOrder }, { deletedAt: { isNull: true } }],
        },
        columns: { id: true, storageKey: true, sortOrder: true },
      });

      await db.transaction(async (tx) => {
        for (const row of group) {
          await tx
            .update(snackItemImages)
            .set({ deletedAt: new Date() })
            .where(eq(snackItemImages.id, row.id));
        }

        const remaining = await tx.query.snackItemImages.findMany({
          where: {
            AND: [{ snackItemId }, { deletedAt: { isNull: true } }],
          },
          columns: { sortOrder: true },
        });
        const orderedSorts = [...new Set(remaining.map((row) => row.sortOrder))].toSorted(
          (a, b) => a - b,
        );
        const compactByOldSort = new Map(
          orderedSorts.map((oldSort, position) => [oldSort, position] as const),
        );
        await applySortMapping(tx, snackItemId, compactByOldSort);
      });

      const deletedKeys = group.map((row) => row.storageKey);
      await Promise.allSettled(deletedKeys.map((key) => deleteFile(key)));

      return { deletedKeys };
    },
  };
}

export type AdminSnacksRepository = ReturnType<typeof createAdminSnacksRepository>;
