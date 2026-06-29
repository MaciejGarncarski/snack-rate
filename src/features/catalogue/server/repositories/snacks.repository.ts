import type { SnackStatus } from "#/features/shared/value-objects/status.vo";
import type { Db } from "#/infrastructure/db/db";
import { snackItemImages, snackItems } from "#/infrastructure/db/schema";

export type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  price: number | null;
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
  } | null;
};

const MAX_SEARCH_RESULTS = 8;

type SnacksRepositoryDeps = {
  db: Db;
  getFileUrl: (storageKey: string) => Promise<string>;
};

type DbSnackItem = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
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
  } | null;
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

  const parsedStatus =
    row.status === "pending" || row.status === "published" || row.status === "rejected"
      ? row.status
      : "pending";

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price ? Number(row.price) : null,
    slug: row.slug,
    barcode: row.barcode,
    avgRating: Number(row.avgRating),
    typeId: row.typeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: parsedStatus,
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
  price?: number;
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

export type TransactionClient = Parameters<Db["transaction"]>[0] extends (tx: infer T) => unknown
  ? T
  : never;

export function createSnacksRepository({ db, getFileUrl }: SnacksRepositoryDeps) {
  return {
    create: async (data: CreateSnackData, tx?: TransactionClient) => {
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
          price: data.price ? data.price.toString() : null,
          barcode: data.barcode || null,
          typeId: snackType.id,
          status: data.status,
        })
        .returning();

      return created;
    },

    addImage: async (data: AddImageData, tx?: TransactionClient) => {
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

      return toSnackItem(foundSnack, getFileUrl);
    },

    list: async (limit: number, cursor?: string): Promise<SnackItem[]> => {
      const rows = await db.query.snackItems.findMany({
        orderBy: (table, { desc }) => [desc(table.createdAt)],
        limit,
        where: cursor
          ? { createdAt: { lt: new Date(cursor) }, status: "published" }
          : { status: "published" },
        with: {
          type: true,
          images: true,
        },
      });

      return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
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
              OR: [{ name: { ilike: `%${query}%` } }, { description: { ilike: `%${query}%` } }],
            },
          ],
        },
      });

      return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
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

    transaction: db.transaction.bind(db),
  };
}

export type SnacksRepository = ReturnType<typeof createSnacksRepository>;
