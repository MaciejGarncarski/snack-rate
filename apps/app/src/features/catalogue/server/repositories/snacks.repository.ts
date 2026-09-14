import { snackItemImages, snackItems } from "@snack-rate/db-schema/schema";
import type { InferSelectModel } from "drizzle-orm";
import { eq, and, or, lt, gt, asc, desc, isNull, type SQL } from "drizzle-orm";

import { Status, type SnackStatus } from "#/features/shared/value-objects/status.vo";
import type { Database, DbTransaction } from "#/infrastructure/db/db";
import { startActiveSpan } from "#/observability/tracing";
import type { SortBy } from "#/schemas/catalogue";

type SnackItemRow = InferSelectModel<typeof snackItems>;

type SnackItemRelations = {
  images: { id: string; storageKey: string; type: string; sortOrder: number }[];
  type: { id: string; name: string; slug: string } | null;
};

export type DecodedCursor = {
  createdAt: Date;
  id: string;
  aggregateValue?: number;
};

export type SnackItem = {
  id: string;
  name: string;
  description: string | null;
  slug: string;
  status: SnackStatus;
  barcode: string | null;
  authorId: string | null;
  rating: { avg: number; count: number };
  typeId: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  aggregateValue?: number;
  images: {
    id: string;
    url: string;
    storageKey: string;
    sortOrder: number;
    type: "default" | "thumbnail";
  }[];
  type: { id: string; name: string; slug: string };
};

const MAX_SEARCH_RESULTS = 8;

function escapeLikePattern(value: string): string {
  return value.replaceAll(/[\\%_]/gu, (char) => `\\${char}`);
}

type SnacksRepositoryDeps = {
  db: Database;
  getFileUrl: (storageKey: string) => Promise<string>;
};

function toSnackItem(
  row: SnackItemRow & SnackItemRelations,
  getFileUrl: (storageKey: string) => Promise<string>,
): Promise<SnackItem> {
  const type = row.type ?? { id: "", name: "", slug: "" };

  const imagePromises = row.images.map(async (img) => {
    const imgType: "default" | "thumbnail" =
      img.type === "default" || img.type === "thumbnail" ? img.type : "default";
    return {
      id: img.id,
      url: await getFileUrl(img.storageKey),
      storageKey: img.storageKey,
      sortOrder: img.sortOrder,
      type: imgType,
    };
  });

  return Promise.all(imagePromises).then((images) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    slug: row.slug,
    barcode: row.barcode,
    authorId: row.authorId,
    rating: { avg: Number(row.avgRating), count: row.ratingCount },
    typeId: row.typeId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    status: Status.create(row.status).getValue(),
    deletedAt: row.deletedAt,
    images,
    type,
  }));
}

type CreateSnackData = {
  name: string;
  slug: string;
  description?: string;
  barcode?: string;
  typeSlug: string;
  status: SnackStatus;
  authorId: string | null;
};

type AddImageData = {
  snackItemId: string;
  storageKey: string;
  type?: "default" | "thumbnail";
  sortOrder: number;
};

async function resolveTypeId(db: Database, typeSlug: string): Promise<string | null> {
  const snackType = await db.query.snackTypes.findFirst({
    where: { slug: typeSlug },
    columns: { id: true },
  });
  return snackType?.id ?? null;
}

async function fetchSnacksByIds(
  db: Database,
  ids: string[],
  getFileUrl: (storageKey: string) => Promise<string>,
): Promise<SnackItem[]> {
  if (ids.length === 0) return [];

  const rows = await db.query.snackItems.findMany({
    where: { id: { in: ids } },
    with: { type: true, images: true },
  });

  const byId = new Map(rows.map((row) => [row.id, row]));

  return Promise.all(
    ids.flatMap((id) => {
      const row = byId.get(id);
      return row ? [toSnackItem(row, getFileUrl)] : [];
    }),
  );
}

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
          authorId: data.authorId,
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

    getBySlug: (slug: string): Promise<SnackItem | null> => {
      return startActiveSpan(
        "db.snacks.getBySlug",
        async (span) => {
          span.setAttribute("snack.slug", slug);

          const found = await db.query.snackItems.findFirst({
            where: { slug, status: "published", deletedAt: { isNull: true } },
            with: { type: true, images: true },
          });

          span.setAttribute("snack.found", !!found);
          if (found) span.setAttribute("snack.id", found.id);

          return found ? toSnackItem(found, getFileUrl) : null;
        },
        { attributes: { "snack.slug": slug } },
      );
    },

    list: (args: {
      limit: number;
      cursor?: DecodedCursor | null;
      typeSlug?: string | null;
      sortBy?: SortBy;
    }): Promise<SnackItem[]> => {
      const { limit, cursor, typeSlug, sortBy } = args;
      const sort = sortBy ?? "newest";

      if (sort === "newest" || sort === "oldest") {
        return listByDate(db, getFileUrl, limit, cursor, typeSlug, sort);
      }

      return listByAggregate(db, getFileUrl, limit, cursor, typeSlug, sort);
    },

    search: async (query: string): Promise<SnackItem[]> => {
      const isInitialQuery = query.trim().length === 0;

      if (isInitialQuery) {
        const rows = await db.query.snackItems.findMany({
          with: { images: true, type: true },
          limit: MAX_SEARCH_RESULTS,
          orderBy: (table) => [desc(table.createdAt), desc(table.id)],
          where: {
            AND: [{ status: "published" }, { deletedAt: { isNull: true } }],
          },
        });

        return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
      }

      const pattern = `%${escapeLikePattern(query)}%`;
      const rows = await db.query.snackItems.findMany({
        with: { images: true, type: true },
        limit: MAX_SEARCH_RESULTS,
        orderBy: (table) => [desc(table.createdAt), desc(table.id)],
        where: {
          AND: [
            { status: "published" },
            { deletedAt: { isNull: true } },
            {
              OR: [
                { name: { ilike: pattern } },
                { barcode: { eq: query } },
                { description: { ilike: pattern } },
              ],
            },
          ],
        },
      });

      return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
    },

    listTypes: () => {
      return db.query.snackTypes.findMany({
        orderBy: (table) => [asc(table.name)],
        columns: { name: true, slug: true },
      });
    },
  };
}

async function listByDate(
  db: Database,
  getFileUrl: (storageKey: string) => Promise<string>,
  limit: number,
  cursor?: DecodedCursor | null,
  typeSlug?: string | null,
  sort?: "newest" | "oldest",
): Promise<SnackItem[]> {
  const direction = sort ?? "newest";
  const typeId = typeSlug ? await resolveTypeId(db, typeSlug) : null;
  if (typeSlug && !typeId) return [];

  const cursorCondition =
    cursor && direction === "newest"
      ? {
          OR: [
            { createdAt: { eq: cursor.createdAt }, id: { lt: cursor.id } },
            { createdAt: { lt: cursor.createdAt } },
          ],
        }
      : cursor && direction === "oldest"
        ? {
            OR: [
              { createdAt: { eq: cursor.createdAt }, id: { gt: cursor.id } },
              { createdAt: { gt: cursor.createdAt } },
            ],
          }
        : {};

  const rows = await db.query.snackItems.findMany({
    orderBy: (table) =>
      direction === "newest"
        ? [desc(table.createdAt), desc(table.id)]
        : [asc(table.createdAt), asc(table.id)],
    where: {
      status: "published",
      deletedAt: { isNull: true },
      ...(typeId ? { typeId: { eq: typeId } } : {}),
      ...cursorCondition,
    },
    with: { type: true, images: true },
    limit,
  });

  return Promise.all(rows.map((row) => toSnackItem(row, getFileUrl)));
}

async function listByAggregate(
  db: Database,
  getFileUrl: (storageKey: string) => Promise<string>,
  limit: number,
  cursor?: DecodedCursor | null,
  typeSlug?: string | null,
  sort?: "most_reviewed" | "most_liked" | "most_disliked",
): Promise<SnackItem[]> {
  const direction = sort ?? "most_reviewed";
  const typeId = typeSlug ? await resolveTypeId(db, typeSlug) : null;
  if (typeSlug && !typeId) return [];

  const sortColumn = direction === "most_reviewed" ? snackItems.ratingCount : snackItems.avgRating;
  const sortDir = direction === "most_disliked" ? asc : desc;

  const conditions: SQL[] = [eq(snackItems.status, "published"), isNull(snackItems.deletedAt)];
  if (typeId) conditions.push(eq(snackItems.typeId, typeId));

  if (cursor?.aggregateValue !== undefined) {
    const agg = String(cursor.aggregateValue);
    const aggCmp = direction === "most_disliked" ? gt : lt;
    const cursorFilter = or(
      aggCmp(sortColumn, agg),
      and(eq(sortColumn, agg), lt(snackItems.createdAt, cursor.createdAt)),
      and(
        eq(sortColumn, agg),
        eq(snackItems.createdAt, cursor.createdAt),
        lt(snackItems.id, cursor.id),
      ),
    );
    if (cursorFilter) conditions.push(cursorFilter);
  }

  const sortedIds = await db
    .select({ id: snackItems.id })
    .from(snackItems)
    .where(and(...conditions))
    .orderBy(sortDir(sortColumn), desc(snackItems.createdAt), desc(snackItems.id))
    .limit(limit);

  const items = await fetchSnacksByIds(
    db,
    sortedIds.map((r) => r.id),
    getFileUrl,
  );

  for (const item of items) {
    item.aggregateValue = direction === "most_reviewed" ? item.rating.count : item.rating.avg;
  }

  return items;
}

export type SnacksRepository = ReturnType<typeof createSnacksRepository>;
