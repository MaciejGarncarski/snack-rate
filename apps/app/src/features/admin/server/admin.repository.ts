import { snackComments, snackItems } from "@snack-rate/db-schema/schema";
import { and, desc, eq, isNull } from "drizzle-orm";

import { getSnackRatingAggregate } from "#/features/comments/server/repositories/ratings";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type AdminComment = {
  id: string;
  body: string | null;
  rating: number | null;
  authorName: string;
  authorType: "user" | "guest";
  createdAt: Date;
  snackItemId: string;
  snackName: string;
  snackSlug: string;
};

export type AdminListInput = {
  limit: number;
  cursor?: string | null;
};

export type AdminListResult = {
  comments: AdminComment[];
  nextCursor: string | null;
};

export type PendingSnack = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  barcode: string | null;
  typeName: string;
  authorName: string | null;
  createdAt: Date;
  images: {
    url: string;
    storageKey: string;
    sortOrder: number;
    type: string;
  }[];
};

export type PendingSnacksResult = {
  snacks: PendingSnack[];
  nextCursor: string | null;
};

export type ReviewDecision = "accept" | "reject";

function resolveAuthorName(name: string | null): string {
  return name?.trim() || "Gość";
}

function encodeCursor(createdAt: Date, id: string): string {
  return Buffer.from(`${createdAt.toISOString()}|${id}`).toString("base64url");
}

function decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
  try {
    const decoded = Buffer.from(cursor, "base64url").toString("utf-8");
    const [iso, id] = decoded.split("|");
    if (!iso || !id) return null;
    const createdAt = new Date(iso);
    if (Number.isNaN(createdAt.getTime())) return null;
    return { createdAt, id };
  } catch {
    return null;
  }
}

export function createAdminRepository({
  db,
  getFileUrl,
}: {
  db: Database;
  getFileUrl: (storageKey: string) => Promise<string>;
}) {
  return {
    listComments: async (input: AdminListInput): Promise<AdminListResult> => {
      const limit = input.limit;
      const decoded = input.cursor ? decodeCursor(input.cursor) : null;

      const rows = await db.query.snackComments.findMany({
        where: {
          AND: [
            { deletedAt: { isNull: true } },
            ...(decoded
              ? [
                  {
                    OR: [
                      { createdAt: { lt: decoded.createdAt } },
                      { createdAt: { eq: decoded.createdAt }, id: { lt: decoded.id } },
                    ],
                  },
                ]
              : []),
          ],
        },
        orderBy: (table) => [desc(table.createdAt), desc(table.id)],
        limit: limit + 1,
        columns: {
          id: true,
          body: true,
          rating: true,
          authorType: true,
          createdAt: true,
          snackItemId: true,
        },
        with: {
          snackItem: {
            columns: { name: true, slug: true },
          },
          author: {
            columns: { name: true },
          },
        },
      });

      const hasMore = rows.length > limit;
      const sliced = hasMore ? rows.slice(0, limit) : rows;

      const comments: AdminComment[] = sliced.flatMap((row) => {
        // Parity with the previous inner join: skip comments whose snack is gone.
        if (!row.snackItem) return [];
        return [
          {
            id: row.id,
            body: row.body,
            rating: row.rating,
            // `author` is only meaningful for user rows; guard on
            // `authorType` to mirror the old conditional join.
            authorName:
              row.authorType === "user" ? resolveAuthorName(row.author?.name ?? null) : "Gość",
            authorType: row.authorType as "user" | "guest",
            createdAt: row.createdAt,
            snackItemId: row.snackItemId,
            snackName: row.snackItem.name,
            snackSlug: row.snackItem.slug,
          },
        ];
      });

      const nextCursor =
        hasMore && sliced.length > 0
          ? encodeCursor(sliced.at(-1)!.createdAt, sliced.at(-1)!.id)
          : null;

      return { comments, nextCursor };
    },

    deleteComment: async (commentId: string, tx?: DbTransaction): Promise<string | null> => {
      const client = tx ?? db;

      const existing = await client.query.snackComments.findFirst({
        where: { id: commentId, deletedAt: { isNull: true } },
        columns: { id: true, snackItemId: true },
      });

      if (!existing) return null;

      await client
        .update(snackComments)
        .set({ deletedAt: new Date() })
        .where(eq(snackComments.id, commentId));

      // Recalculate avgRating / ratingCount for related snack
      const { avg: avgValue, count } = await getSnackRatingAggregate(client, existing.snackItemId);

      await client
        .update(snackItems)
        .set({ avgRating: String(avgValue), ratingCount: count })
        .where(eq(snackItems.id, existing.snackItemId));

      return existing.snackItemId;
    },

    listPendingSnacks: async (input: AdminListInput): Promise<PendingSnacksResult> => {
      const limit = input.limit;
      const decoded = input.cursor ? decodeCursor(input.cursor) : null;

      const rows = await db.query.snackItems.findMany({
        where: {
          AND: [
            { status: "pending" },
            { deletedAt: { isNull: true } },
            ...(decoded
              ? [
                  {
                    OR: [
                      { createdAt: { lt: decoded.createdAt } },
                      { createdAt: { eq: decoded.createdAt }, id: { lt: decoded.id } },
                    ],
                  },
                ]
              : []),
          ],
        },
        orderBy: (table) => [desc(table.createdAt), desc(table.id)],
        limit: limit + 1,
        columns: {
          id: true,
          name: true,
          slug: true,
          description: true,
          barcode: true,
          createdAt: true,
        },
        with: {
          type: { columns: { name: true } },
          images: true,
          author: { columns: { name: true } },
        },
      });

      const hasMore = rows.length > limit;
      const sliced = hasMore ? rows.slice(0, limit) : rows;

      const snacks: PendingSnack[] = await Promise.all(
        sliced.map(async (row) => ({
          id: row.id,
          name: row.name,
          slug: row.slug,
          description: row.description,
          barcode: row.barcode,
          typeName: row.type?.name ?? "",
          authorName: row.author?.name?.trim() || null,
          createdAt: row.createdAt,
          images: await Promise.all(
            row.images.map(async (img) => ({
              url: await getFileUrl(img.storageKey),
              storageKey: img.storageKey,
              sortOrder: img.sortOrder,
              type: img.type,
            })),
          ),
        })),
      );

      const nextCursor =
        hasMore && sliced.length > 0
          ? encodeCursor(sliced.at(-1)!.createdAt, sliced.at(-1)!.id)
          : null;

      return { snacks, nextCursor };
    },

    reviewSnack: async (
      snackItemId: string,
      decision: ReviewDecision,
      tx?: DbTransaction,
    ): Promise<"published" | "rejected" | null> => {
      const client = tx ?? db;
      const status = decision === "accept" ? "published" : "rejected";

      // Only transition out of pending: already-reviewed or missing rows match nothing.
      const [updated] = await client
        .update(snackItems)
        .set({ status })
        .where(
          and(
            eq(snackItems.id, snackItemId),
            eq(snackItems.status, "pending"),
            isNull(snackItems.deletedAt),
          ),
        )
        .returning({ id: snackItems.id });

      return updated ? status : null;
    },
  };
}

export type AdminRepository = ReturnType<typeof createAdminRepository>;
