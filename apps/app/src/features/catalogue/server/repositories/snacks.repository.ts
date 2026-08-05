import { snackItemImages, snackItems } from "@snack-rate/db-schema/schema";
import type { TableFilter } from "drizzle-orm";

import { Status, type SnackStatus } from "#/features/shared/value-objects/status.vo";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

export type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: SnackStatus;
  barcode: string | null;
  avgRating: number;
  typeId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  thumbnailUrl: string | null;
  images: {
    id: string;
    url: string;
    storageKey: string;
    sortOrder: number;
    type: "default" | "thumbnail";
  }[];
  type: {
    id: string;
    name: string;
    slug: string;
  };
};

const MAX_SEARCH_RESULTS = 8;

type SnacksRepositoryDeps = {
  db: Database;
  getFileUrl: (storageKey: string) => Promise<string>;
};

type DbSnackItem = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: string;
  barcode: string | null;
  avgRating: string;
  typeId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  images: {
    id: string;
    storageKey: string;
    type: string;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  }[];
  type: {
    id: string;
    name: string;
    slug: string;
  };
};

async function toSnackItem(
  row: DbSnackItem,
  getFileUrl: (storageKey: string) => Promise<string>,
): Promise<SnackItem> {
  const images = await Promise.all(
    row.images.map(
      async (img): Promise<SnackItem["images"][0]> => ({
        id: img.id,
        url: await getFileUrl(img.storageKey),
        storageKey: img.storageKey,
        sortOrder: img.sortOrder,
        type: img.type === "default" || img.type === "thumbnail" ? img.type : "default",
      }),
    ),
  );

  const thumbnailImage = row.images.find((img) => img.type === "thumbnail");
  const thumbnailUrl = thumbnailImage ? await getFileUrl(thumbnailImage.storageKey) : null;

  const status = Status.create(row.status).getValue();

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug,
    barcode: row.barcode,
    avgRating: Number(row.avgRating),
    typeId: row.typeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status,
    deletedAt: row.deletedAt,
    thumbnailUrl,
    images,
    type: row.type,
  };
}

type CreateSnackData = {
  name: string;
  slug: string;
  description?: string;
  barcode?: string;
  typeSlug: string;
  status: SnackStatus;
};

type AddImageData = {
  snackItemId: string;
  storageKey: string;
  type?: "default" | "thumbnail";
  sortOrder: number;
};

export function createSnacksRepository({ db, getFileUrl }: SnacksRepositoryDeps) {
  return {
    create: async (data: CreateSnackData, tx?: DbTransaction) => {
      const client = tx ?? db;

      const snackType = await client.query.snackTypes.findFirst({
        where: { slug: data.typeSlug },
      });

      if (!snackType) {
        throw new Error(`Snack type with slug ${data.typeSlug} not found`);
      }

      const [created] = await client
        .insert(snackItems)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          barcode: data.barcode || null,
          typeId: snackType.id,
          status: data.status,
        })
        .returning();

      return created;
    },

    addImage: async (data: AddImageData, tx?: DbTransaction) => {
      const client = tx ?? db;
      const [created] = await client
        .insert(snackItemImages)
        .values({
          snackItemId: data.snackItemId,
          storageKey: data.storageKey,
          type: data.type ?? "default",
          sortOrder: data.sortOrder,
        })
        .returning();

      return created;
    },

    getBySlug: async (slug: string): Promise<SnackItem | null> => {
      const foundSnack = await db.query.snackItems.findFirst({
        where: { slug, status: "published" },
        with: {
          type: true,
          images: true,
        },
      });

      if (!foundSnack) return null;

      return toSnackItem(foundSnack as DbSnackItem, getFileUrl);
    },

    list: async (limit: number, cursor?: DecodedCursor | null): Promise<SnackItem[]> => {
      const whereConditions: TableFilter<typeof snackItems> = {
        status: "published",
        deletedAt: { isNull: true },
      };

      if (cursor) {
        whereConditions.OR = [
          {
            createdAt: { eq: cursor.createdAt },
            id: { lt: cursor.id },
          },
          { createdAt: { lt: cursor.createdAt } },
        ];
      }

      const rows = await db.query.snackItems.findMany({
        orderBy: (table, { desc }) => [desc(table.createdAt), desc(table.id)],
        where: whereConditions,
        with: {
          type: true,
          images: true,
        },
        limit,
      });

      return Promise.all(rows.map((row) => toSnackItem(row as DbSnackItem, getFileUrl)));
    },

    search: async (query: string): Promise<SnackItem[]> => {
      const rows = await db.query.snackItems.findMany({
        with: {
          images: true,
          type: true,
        },
        limit: MAX_SEARCH_RESULTS,
        where: {
          AND: [
            { status: "published" },
            {
              OR: [
                { name: { ilike: `%${query}%` } },
                { barcode: { eq: query } },
                { description: { ilike: `%${query}%` } },
              ],
            },
          ],
        },
      });

      return Promise.all(rows.map((row) => toSnackItem(row as DbSnackItem, getFileUrl)));
    },

    listTypes: () => {
      return db.query.snackTypes.findMany({
        orderBy: (table, { asc }) => [asc(table.name)],
        columns: {
          name: true,
          slug: true,
        },
      });
    },
  };
}

export type SnacksRepository = ReturnType<typeof createSnacksRepository>;
