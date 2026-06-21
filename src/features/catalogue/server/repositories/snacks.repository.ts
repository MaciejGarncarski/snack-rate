import type { SnackStatus } from "#/features/shared/value-objects/status.vo";
import type { Db } from "#/infrastructure/db/db";
import { snackItemImages, snackItems } from "#/infrastructure/db/schema";

export type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  slug: string;
  status: SnackStatus;
  barcode: string | null;
  avgRating: number;
  brandId: string | null;
  typeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  images: {
    id: string;
    url: string;
    storageKey: string;
    isPrimary: boolean;
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
  brandId: string | null;
  typeId: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  images: {
    id: string;
    storageKey: string;
    isPrimary: boolean;
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
    row.images.map(async (img) => ({
      id: img.id,
      url: await getFileUrl(img.storageKey),
      storageKey: img.storageKey,
      isPrimary: img.isPrimary,
      sortOrder: img.sortOrder,
      createdAt: img.createdAt,
      updatedAt: img.updatedAt,
      deletedAt: img.deletedAt,
    })),
  );

  const parsedStatus =
    row.status === "pending" || row.status === "published" || row.status === "rejected"
      ? row.status
      : "pending";

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price ? parseFloat(row.price) : 0,
    slug: row.slug,
    barcode: row.barcode,
    avgRating: parseFloat(row.avgRating),
    brandId: row.brandId,
    typeId: row.typeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: parsedStatus,
    deletedAt: row.deletedAt,
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
  brandId?: string;
  typeId?: string;
  status: SnackStatus;
};

type AddImageData = {
  snackItemId: string;
  storageKey: string;
  sortOrder: number;
  isPrimary: boolean;
};

export type TransactionClient = Parameters<Db["transaction"]>[0] extends (tx: infer T) => unknown
  ? T
  : never;

export function createSnacksRepository({ db, getFileUrl }: SnacksRepositoryDeps) {
  return {
    create: async (data: CreateSnackData, tx?: TransactionClient) => {
      const client = tx ?? db;
      const [created] = await client
        .insert(snackItems)
        .values({
          name: data.name,
          slug: data.slug,
          description: data.description || null,
          price: data.price === null ? null : String(data.price),
          barcode: data.barcode || null,
          brandId: data.brandId || null,
          typeId: data.typeId || null,
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
          sortOrder: data.sortOrder,
          isPrimary: data.isPrimary,
        })
        .returning();

      return created;
    },

    getBySlug: async (slug: string): Promise<SnackItem | null> => {
      const foundSnack = await db.query.snackItems.findFirst({
        where: { slug, status: "published" },
        with: {
          brand: true,
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
          brand: true,
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
          brand: true,
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

    listBrands: () => {
      return db.query.brands.findMany({
        orderBy: (table, { asc }) => [asc(table.name)],
      });
    },

    listTypes: () => {
      return db.query.snackTypes.findMany({
        orderBy: (table, { asc }) => [asc(table.name)],
      });
    },

    transaction: db.transaction.bind(db),
  };
}

export type SnacksRepository = ReturnType<typeof createSnacksRepository>;
