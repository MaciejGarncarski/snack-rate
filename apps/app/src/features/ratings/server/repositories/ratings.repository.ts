import { snackComments, snackItems } from "@snack-rate/db-schema/schema";
import { and, eq, isNotNull, isNull, sql } from "drizzle-orm";
import type { TableFilter } from "drizzle-orm";

import { Rating } from "#/features/shared/value-objects/rating.vo";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

type RatingsRepositoryDeps = {
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
  userRating: number | null;
  userBody: string | null;
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

export function createRatingsRepository({ db }: RatingsRepositoryDeps) {
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

      const [aggregate, userReview] = await Promise.all([
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
              columns: { rating: true, body: true },
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
        userRating: userReview ? userReview.rating : null,
        userBody: userReview?.body ?? null,
      };
    },
  };
}

export type RatingsRepository = ReturnType<typeof createRatingsRepository>;
