import { snackComments, snackItems, users } from "@snack-rate/db-schema/schema";
import { and, asc, desc, eq, inArray, isNotNull, isNull, lt, or, sql } from "drizzle-orm";
import type { TableFilter } from "drizzle-orm";

import type { SnackComment, SnackCommentReply } from "#/features/comments/contracts/comments";
import { Rating } from "#/features/shared/value-objects/rating.vo";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

type CommentsRepositoryDeps = {
  db: Database;
};

export type UpsertRatingData = {
  snackItemId: string;
  rating: Rating;
  body: string | null;
  userId: string | null;
  guestId: string | null;
};

export type RatingResult = {
  id: string;
  snackItemId: string;
  userId: string | null;
  guestId: string | null;
  rating: number | null;
  body: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SnackRatingsResult = {
  avgRating: number;
  ratingCount: number;
  distribution: Record<string, number>;
  userRating: {
    body: string | null;
    value: number;
    updatedAt: Date | null;
  } | null;
};

type Identity = { column: "userId" | "guestId"; value: string };

function userOrGuestIdentity(userId: string | null, guestId: string | null): Identity {
  if (userId) return { column: "userId", value: userId };
  if (!guestId) throw new Error("Either userId or guestId must be provided");
  return { column: "guestId", value: guestId };
}

function whereUserOrGuest(
  snackItemId: string,
  userId: string | null,
  guestId: string | null,
): TableFilter<typeof snackComments> {
  const identity = userOrGuestIdentity(userId, guestId);
  return identity.column === "userId"
    ? {
        snackItemId,
        userId: identity.value,
        rating: { isNotNull: true },
        deletedAt: { isNull: true },
      }
    : {
        snackItemId,
        guestId: identity.value,
        rating: { isNotNull: true },
        deletedAt: { isNull: true },
      };
}

function whereUserOrGuestSql(
  snackItemId: string,
  userId: string | null,
  guestId: string | null,
): ReturnType<typeof and> {
  const identity = userOrGuestIdentity(userId, guestId);
  const column = identity.column === "userId" ? snackComments.userId : snackComments.guestId;
  return and(
    eq(snackComments.snackItemId, snackItemId),
    eq(column, identity.value),
    isNotNull(snackComments.rating),
    isNull(snackComments.deletedAt),
  );
}

function resolveAuthorName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Gość";
}

async function queryCommentsForSnack(
  client: Database | DbTransaction,
  data: { snackItemId: string; limit: number; cursor: DecodedCursor | null },
): Promise<SnackComment[]> {
  const conditions = [
    eq(snackComments.snackItemId, data.snackItemId),
    isNull(snackComments.parentCommentId),
    isNotNull(snackComments.rating),
    isNull(snackComments.deletedAt),
    data.cursor
      ? or(
          lt(snackComments.createdAt, data.cursor.createdAt),
          and(
            eq(snackComments.createdAt, data.cursor.createdAt),
            lt(snackComments.id, data.cursor.id),
          ),
        )
      : undefined,
  ];

  const commentRows = await client
    .select({
      id: snackComments.id,
      rating: snackComments.rating,
      body: snackComments.body,
      createdAt: snackComments.createdAt,
      updatedAt: snackComments.updatedAt,
      firstName: users.firstName,
      lastName: users.lastName,
    })
    .from(snackComments)
    .leftJoin(users, eq(snackComments.userId, users.id))
    .where(and(...conditions))
    .orderBy(desc(snackComments.createdAt), desc(snackComments.id))
    .limit(data.limit);

  const commentIds = commentRows.map((row) => row.id);

  const replyRows =
    commentIds.length > 0
      ? await client
          .select({
            id: snackComments.id,
            parentCommentId: snackComments.parentCommentId,
            body: snackComments.body,
            createdAt: snackComments.createdAt,
            firstName: users.firstName,
            lastName: users.lastName,
          })
          .from(snackComments)
          .leftJoin(users, eq(snackComments.userId, users.id))
          .where(
            and(
              inArray(snackComments.parentCommentId, commentIds),
              isNull(snackComments.deletedAt),
            ),
          )
          .orderBy(asc(snackComments.createdAt), asc(snackComments.id))
      : [];

  const repliesByComment = new Map<string, SnackCommentReply[]>();
  for (const reply of replyRows) {
    if (!reply.parentCommentId) continue;
    const list = repliesByComment.get(reply.parentCommentId) ?? [];
    list.push({
      id: reply.id,
      authorName: resolveAuthorName(reply.firstName, reply.lastName),
      body: reply.body,
      createdAt: reply.createdAt,
    });
    repliesByComment.set(reply.parentCommentId, list);
  }

  return commentRows.map((row) => {
    const replies = repliesByComment.get(row.id) ?? [];
    return {
      id: row.id,
      rating: row.rating ?? 0,
      body: row.body,
      authorName: resolveAuthorName(row.firstName, row.lastName),
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isEdited: row.updatedAt.getTime() > row.createdAt.getTime(),
      repliesCount: replies.length,
      replies,
    };
  });
}

export function createCommentsRepository({ db }: CommentsRepositoryDeps) {
  return {
    upsertRating: async (data: UpsertRatingData, tx?: DbTransaction): Promise<RatingResult> => {
      const client = tx ?? db;

      if (!data.userId && !data.guestId) {
        throw new Error("Either userId or guestId must be provided");
      }

      const existing = await client.query.snackComments.findFirst({
        where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
        columns: { id: true },
      });

      const isUpdate = !!existing;

      if (existing) {
        await client
          .update(snackComments)
          .set({ deletedAt: new Date() })
          .where(eq(snackComments.id, existing.id));
      }

      const [created] = await client
        .insert(snackComments)
        .values({
          snackItemId: data.snackItemId,
          userId: data.userId,
          guestId: data.guestId,
          rating: data.rating.getValue(),
          updatedAt: isUpdate ? new Date() : undefined,
          body: data.body,
        })
        .returning();

      return { ...created, rating: created.rating, body: created.body };
    },

    getRating: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
      tx?: DbTransaction;
    }): Promise<number | null> => {
      const client = data.tx ?? db;

      if (!data.userId && !data.guestId) return null;

      const result = await client.query.snackComments.findFirst({
        where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
        columns: { rating: true },
      });

      return result ? result.rating : null;
    },

    recalculateAvgRating: async (snackItemId: string, tx?: DbTransaction): Promise<void> => {
      const client = tx ?? db;

      const result = await client
        .select({
          avg: sql<string>`COALESCE(AVG(${snackComments.rating})::numeric, 0)`,
        })
        .from(snackComments)
        .where(
          and(
            eq(snackComments.snackItemId, snackItemId),
            isNotNull(snackComments.rating),
            isNull(snackComments.deletedAt),
          ),
        );

      const avgValue = Math.round(Number(result[0]?.avg ?? 0) * 100) / 100;

      await client
        .update(snackItems)
        .set({ avgRating: String(avgValue) })
        .where(eq(snackItems.id, snackItemId));
    },

    removeRating: async (
      data: {
        snackItemId: string;
        userId: string | null;
        guestId: string | null;
      },
      tx?: DbTransaction,
    ): Promise<void> => {
      const client = tx ?? db;

      if (!data.userId && !data.guestId) {
        throw new Error("Either userId or guestId must be provided");
      }

      await client
        .update(snackComments)
        .set({ deletedAt: new Date() })
        .where(whereUserOrGuestSql(data.snackItemId, data.userId, data.guestId));
    },

    getRatingsForSnack: async (
      data: {
        snackItemId: string;
        userId: string | null;
        guestId: string | null;
      },
      tx?: DbTransaction,
    ): Promise<SnackRatingsResult> => {
      const client = tx ?? db;

      const [aggregate, userComment] = await Promise.all([
        client
          .select({
            avg: sql<string>`COALESCE(AVG(${snackComments.rating})::numeric, 0)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(snackComments)
          .where(
            and(
              eq(snackComments.snackItemId, data.snackItemId),
              isNotNull(snackComments.rating),
              isNull(snackComments.deletedAt),
            ),
          ),
        data.userId || data.guestId
          ? client.query.snackComments.findFirst({
              where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
              columns: { rating: true, body: true, updatedAt: true },
            })
          : Promise.resolve(null),
      ]);

      const count = Number(aggregate[0]?.count ?? 0);
      const avgRating = count > 0 ? Math.round(Number(aggregate[0]?.avg ?? 0) * 100) / 100 : 0;

      const distribution: Record<string, number> = {};
      if (count > 0) {
        const rows = await client
          .select({ rating: snackComments.rating, count: sql<number>`COUNT(*)` })
          .from(snackComments)
          .where(
            and(
              eq(snackComments.snackItemId, data.snackItemId),
              isNotNull(snackComments.rating),
              isNull(snackComments.deletedAt),
            ),
          )
          .groupBy(snackComments.rating);

        for (const row of rows) {
          distribution[String(row.rating)] = Number(row.count);
        }
      }

      return {
        avgRating,
        ratingCount: count,
        distribution,
        userRating: userComment
          ? {
              body: userComment.body,
              value: userComment.rating ?? 0,
              updatedAt: userComment.updatedAt,
            }
          : null,
      };
    },

    listCommentsForSnack: (
      data: {
        snackItemId: string;
        limit: number;
        cursor: DecodedCursor | null;
      },
      tx?: DbTransaction,
    ): Promise<SnackComment[]> => {
      const client = tx ?? db;
      return queryCommentsForSnack(client, data);
    },
  };
}

export type CommentsRepository = ReturnType<typeof createCommentsRepository>;
