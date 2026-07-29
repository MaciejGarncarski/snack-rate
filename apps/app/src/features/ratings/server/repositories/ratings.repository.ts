import { snackItems, snackReviews } from "@snack-rate/db-schema/schema";
import { and, eq, isNull, sql } from "drizzle-orm";

import { Rating } from "#/features/shared/value-objects/rating.vo";
import type { Db } from "#/infrastructure/db/db";

type RatingsRepositoryDeps = {
  db: Db;
};

export type UpsertRatingData = {
  snackItemId: string;
  rating: Rating;
  userId: string | null;
  guestId: string | null;
};

export type RatingResult = {
  id: string;
  snackItemId: string;
  userId: string | null;
  guestId: string | null;
  rating: number;
  createdAt: Date;
  updatedAt: Date;
};

export type SnackRatingsResult = {
  avgRating: number;
  ratingCount: number;
  distribution: Record<string, number>;
  userRating: number | null;
};

export type TransactionClient = Parameters<Db["transaction"]>[0] extends (tx: infer T) => unknown
  ? T
  : never;

function whereUserOrGuest(snackItemId: string, userId: string | null, guestId: string | null) {
  if (userId) {
    return and(
      eq(snackReviews.userId, userId),
      eq(snackReviews.snackItemId, snackItemId),
      isNull(snackReviews.deletedAt),
    );
  }

  if (!guestId) {
    throw new Error("Either userId or guestId must be provided");
  }

  return and(
    eq(snackReviews.guestId, guestId),
    eq(snackReviews.snackItemId, snackItemId),
    isNull(snackReviews.deletedAt),
  );
}

function toRatingResult(row: {
  id: string;
  snackItemId: string;
  userId: string | null;
  guestId: string | null;
  rating: string;
  createdAt: Date;
  updatedAt: Date;
}): RatingResult {
  return {
    ...row,
    rating: Number(row.rating),
  };
}

export function createRatingsRepository({ db }: RatingsRepositoryDeps) {
  return {
    upsertRating: async (data: UpsertRatingData, tx?: TransactionClient): Promise<RatingResult> => {
      const client = tx ?? (db as unknown as TransactionClient);

      if (!data.userId && !data.guestId) {
        throw new Error("Either userId or guestId must be provided");
      }

      const existing = await client
        .select({ id: snackReviews.id })
        .from(snackReviews)
        .where(whereUserOrGuest(data.snackItemId, data.userId, data.guestId))
        .limit(1);

      if (existing.length > 0) {
        await client
          .update(snackReviews)
          .set({ deletedAt: new Date() })
          .where(eq(snackReviews.id, existing[0].id));
      }

      const [created] = await client
        .insert(snackReviews)
        .values({
          snackItemId: data.snackItemId,
          userId: data.userId,
          guestId: data.guestId,
          rating: String(data.rating.getValue()),
        })
        .returning();

      return toRatingResult(created as typeof created & { rating: string });
    },

    getRating: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
    }): Promise<number | null> => {
      if (!data.userId && !data.guestId) return null;

      const result = await db
        .select({ rating: snackReviews.rating })
        .from(snackReviews)
        .where(whereUserOrGuest(data.snackItemId, data.userId, data.guestId))
        .limit(1);

      return result.length > 0 ? Number(result[0].rating) : null;
    },

    recalculateAvgRating: async (snackItemId: string, tx?: TransactionClient): Promise<void> => {
      const client = tx ?? (db as unknown as TransactionClient);

      const result = await client
        .select({
          avg: sql<string>`COALESCE(AVG(${snackReviews.rating})::numeric, 0)`,
        })
        .from(snackReviews)
        .where(and(eq(snackReviews.snackItemId, snackItemId), isNull(snackReviews.deletedAt)));

      const avgValue = Number(result[0]?.avg ?? 0);
      const rounded = Math.round(avgValue * 100) / 100;

      await client
        .update(snackItems)
        .set({ avgRating: String(rounded) })
        .where(eq(snackItems.id, snackItemId));
    },

    removeRating: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
    }): Promise<void> => {
      if (!data.userId && !data.guestId) {
        throw new Error("Either userId or guestId must be provided");
      }

      await db
        .update(snackReviews)
        .set({ deletedAt: new Date() })
        .where(whereUserOrGuest(data.snackItemId, data.userId, data.guestId));
    },

    getRatingsForSnack: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
      tx?: TransactionClient;
    }): Promise<SnackRatingsResult> => {
      const client = data.tx ?? (db as unknown as TransactionClient);

      const [aggregate, userRating] = await Promise.all([
        client
          .select({
            avg: sql<string>`COALESCE(AVG(${snackReviews.rating})::numeric, 0)`,
            count: sql<number>`COUNT(*)`,
          })
          .from(snackReviews)
          .where(
            and(eq(snackReviews.snackItemId, data.snackItemId), isNull(snackReviews.deletedAt)),
          ),
        data.userId || data.guestId
          ? client
              .select({ rating: snackReviews.rating })
              .from(snackReviews)
              .where(whereUserOrGuest(data.snackItemId, data.userId, data.guestId))
              .limit(1)
          : Promise.resolve([]),
      ]);

      const count = Number(aggregate[0]?.count ?? 0);
      const avgRating = count > 0 ? Math.round(Number(aggregate[0]?.avg ?? 0) * 100) / 100 : 0;

      const distribution: Record<string, number> = {};
      if (count > 0) {
        const rows = await client
          .select({ rating: snackReviews.rating, count: sql<number>`COUNT(*)` })
          .from(snackReviews)
          .where(
            and(eq(snackReviews.snackItemId, data.snackItemId), isNull(snackReviews.deletedAt)),
          )
          .groupBy(snackReviews.rating);

        for (const row of rows) {
          distribution[Number(row.rating).toFixed(1)] = Number(row.count);
        }
      }

      return {
        avgRating,
        ratingCount: count,
        distribution,
        userRating: userRating.length > 0 ? Number(userRating[0].rating) : null,
      };
    },

    transaction: db.transaction.bind(db),
  };
}

export type RatingsRepository = ReturnType<typeof createRatingsRepository>;
