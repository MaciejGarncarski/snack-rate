import type { SnackComment } from "#/features/comments/contracts/comments";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

import { queryCommentsForSnack, type DecodedCursor } from "./queries";
import {
  upsertRating as upsertRatingFn,
  getRating as getRatingFn,
  recalculateAvgRating as recalculateAvgRatingFn,
  removeRating as removeRatingFn,
  getRatingsForSnack as getRatingsForSnackFn,
  type UpsertRatingData,
  type RatingResult,
  type SnackRatingsResult,
} from "./ratings";

export type { DecodedCursor, UpsertRatingData, RatingResult, SnackRatingsResult };

type CommentsRepositoryDeps = {
  db: Database;
};

export function createCommentsRepository({ db }: CommentsRepositoryDeps) {
  return {
    upsertRating: (data: UpsertRatingData, tx?: DbTransaction): Promise<RatingResult> => {
      return upsertRatingFn(db, data, tx);
    },

    getRating: (data: {
      snackItemId: string;
      userId: string | null;
      guestId: string | null;
      tx?: DbTransaction;
    }): Promise<number | null> => {
      return getRatingFn(db, data);
    },

    recalculateAvgRating: (snackItemId: string, tx?: DbTransaction): Promise<void> => {
      return recalculateAvgRatingFn(db, snackItemId, tx);
    },

    removeRating: (
      data: {
        snackItemId: string;
        userId: string | null;
        guestId: string | null;
      },
      tx?: DbTransaction,
    ): Promise<void> => {
      return removeRatingFn(db, data, tx);
    },

    getRatingsForSnack: (
      data: {
        snackItemId: string;
        userId: string | null;
        guestId: string | null;
      },
      tx?: DbTransaction,
    ): Promise<SnackRatingsResult> => {
      return getRatingsForSnackFn(db, data, tx);
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
