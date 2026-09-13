import { snackComments, snackItems } from "@snack-rate/db-schema/schema";
import { desc, eq } from "drizzle-orm";

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

export function createAdminRepository({ db }: { db: Database }) {
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
  };
}

export type AdminRepository = ReturnType<typeof createAdminRepository>;
