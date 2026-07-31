import { snackItems, snackReviews } from "@snack-rate/db-schema/schema";
import { and, eq, isNull, sql } from "drizzle-orm";
import type { TableFilter } from "drizzle-orm";

import { Rating } from "#/features/shared/value-objects/rating.vo";
import type { Db, DbTransaction } from "#/infrastructure/db/db";

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
): TableFilter<typeof snackReviews> {
  const identity = userOrGuestIdentity(userId, guestId);
  return identity.column === "userId"
    ? { snackItemId, userId: identity.value, deletedAt: { isNull: true } }
    : { snackItemId, guestId: identity.value, deletedAt: { isNull: true } };
}

function whereUserOrGuestSql(
  snackItemId: string,
  userId: string | null,
  guestId: string | null,
): ReturnType<typeof and> {
  const identity = userOrGuestIdentity(userId, guestId);
  const column = identity.column === "userId" ? snackReviews.userId : snackReviews.guestId;
  return and(
    eq(snackReviews.snackItemId, snackItemId),
    eq(column, identity.value),
    isNull(snackReviews.deletedAt),
  );
}

export function createRatingsRepository({ db }: RatingsRepositoryDeps) {
  return {
    upsertRating: async (data: UpsertRatingData, tx?: DbTransaction): Promise<RatingResult> => {
      const client = tx ?? db;

      if (!data.userId && !data.guestId) {
        throw new Error("Either userId or guestId must be provided");
      }

      const existing = await client.query.snackReviews.findFirst({
        where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
        columns: { id: true },
      });

      if (existing) {
        await client
          .update(snackReviews)
          .set({ deletedAt: new Date() })
          .where(eq(snackReviews.id, existing.id));
      }

      const [created] = await client
        .insert(snackReviews)
        .values({
          snackItemId: data.snackItemId,
          userId: data.userId,
          guestId: data.guestId,
          rating: data.rating.getValue(),
        })
        .returning();

      return created;
    },

    getRating: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
      tx?: DbTransaction;
    }): Promise<number | null> => {
      const client = data.tx ?? db;

      if (!data.userId && !data.guestId) return null;

      const result = await client.query.snackReviews.findFirst({
        where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
        columns: { rating: true },
      });

      return result ? result.rating : null;
    },

    recalculateAvgRating: async (snackItemId: string, tx?: DbTransaction): Promise<void> => {
      const client = tx ?? db;

      const result = await client
        .select({
          avg: sql<string>`COALESCE(AVG(${snackReviews.rating})::numeric, 0)`,
        })
        .from(snackReviews)
        .where(and(eq(snackReviews.snackItemId, snackItemId), isNull(snackReviews.deletedAt)));

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
        .update(snackReviews)
        .set({ deletedAt: new Date() })
        .where(whereUserOrGuestSql(data.snackItemId, data.userId, data.guestId));
    },

    getRatingsForSnack: async (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
      tx?: DbTransaction;
    }): Promise<SnackRatingsResult> => {
      const client = data.tx ?? db;

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
          ? client.query.snackReviews.findFirst({
              where: whereUserOrGuest(data.snackItemId, data.userId, data.guestId),
              columns: { rating: true },
            })
          : Promise.resolve(null),
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
          distribution[String(row.rating)] = Number(row.count);
        }
      }

      return {
        avgRating,
        ratingCount: count,
        distribution,
        userRating: userRating ? userRating.rating : null,
      };
    },
  };
}

export type RatingsRepository = ReturnType<typeof createRatingsRepository>;
