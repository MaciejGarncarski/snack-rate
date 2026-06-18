import type { Db } from "#/infrastructure/db/db";

export type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  slug: string;
  barcode: string | null;
  avgRating: number;
  brandId: string | null;
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
  tags: {
    id: string;
    name: string;
    slug: string;
  }[];
};

const MAX_SEARCH_RESULTS = 6;

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
  barcode: string | null;
  avgRating: string;
  brandId: string | null;
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
  tags: {
    tag: {
      id: string;
      name: string;
      slug: string;
    } | null;
  }[];
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

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    price: row.price ? parseFloat(row.price) : 0,
    slug: row.slug,
    barcode: row.barcode,
    avgRating: parseFloat(row.avgRating),
    brandId: row.brandId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt,
    images,
    tags: row.tags
      .filter((t): t is { tag: NonNullable<typeof t.tag> } => t.tag !== null)
      .map((t) => ({
        id: t.tag.id,
        name: t.tag.name,
        slug: t.tag.slug,
      })),
  };
}

export function createSnacksRepository({ db, getFileUrl }: SnacksRepositoryDeps) {
  return {
    getBySlug: async (slug: string): Promise<SnackItem | null> => {
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

      return toSnackItem(foundSnack, getFileUrl);
    },

    list: async (limit: number, cursor?: string): Promise<SnackItem[]> => {
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

      return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
    },

    search: async (query: string): Promise<SnackItem[]> => {
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

      return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
    },
  };
}

export type SnacksRepository = ReturnType<typeof createSnacksRepository>;
