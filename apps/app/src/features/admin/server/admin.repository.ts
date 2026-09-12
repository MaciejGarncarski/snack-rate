import { snackComments, snackItems, user } from "@snack-rate/db-schema/schema";
import { and, desc, eq, isNull, lt, or, sql } from "drizzle-orm";

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

function resolveAuthorName(username: string | null): string {
  return username?.trim() || "Gość";
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

      const cursorCondition = decoded
        ? or(
            lt(snackComments.createdAt, decoded.createdAt),
            and(eq(snackComments.createdAt, decoded.createdAt), lt(snackComments.id, decoded.id)),
          )
        : undefined;

      const conditions = [isNull(snackComments.deletedAt), cursorCondition].filter(
        (c): c is NonNullable<typeof c> => c !== undefined,
      );

      const rows = await db
        .select({
          id: snackComments.id,
          body: snackComments.body,
          rating: snackComments.rating,
          authorType: snackComments.authorType,
          createdAt: snackComments.createdAt,
          snackItemId: snackComments.snackItemId,
          snackName: snackItems.name,
          snackSlug: snackItems.slug,
          username: user.username,
        })
        .from(snackComments)
        .innerJoin(snackItems, eq(snackComments.snackItemId, snackItems.id))
        .leftJoin(
          user,
          and(eq(snackComments.authorType, "user"), eq(snackComments.authorId, user.id)),
        )
        .where(and(...conditions))
        .orderBy(desc(snackComments.createdAt), desc(snackComments.id))
        .limit(limit + 1);

      const hasMore = rows.length > limit;
      const sliced = hasMore ? rows.slice(0, limit) : rows;

      const comments: AdminComment[] = sliced.map((row) => ({
        id: row.id,
        body: row.body,
        rating: row.rating,
        authorName: resolveAuthorName(row.username),
        authorType: row.authorType as "user" | "guest",
        createdAt: row.createdAt,
        snackItemId: row.snackItemId,
        snackName: row.snackName,
        snackSlug: row.snackSlug,
      }));

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
      const result = await client
        .select({
          avg: sql<string>`COALESCE(AVG(${snackComments.rating})::numeric, 0)`,
          count: sql<number>`COUNT(*)`,
        })
        .from(snackComments)
        .where(
          and(
            eq(snackComments.snackItemId, existing.snackItemId),
            isNull(snackComments.deletedAt),
            sql`${snackComments.rating} IS NOT NULL`,
          ),
        );

      const count = Number(result[0]?.count ?? 0);
      const avgValue = count > 0 ? Math.round(Number(result[0]?.avg ?? 0) * 100) / 100 : 0;

      await client
        .update(snackItems)
        .set({ avgRating: String(avgValue), ratingCount: count })
        .where(eq(snackItems.id, existing.snackItemId));

      return existing.snackItemId;
    },
  };
}

export type AdminRepository = ReturnType<typeof createAdminRepository>;
