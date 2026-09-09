import type { ReactionType } from "#/features/comments/consts/reaction-type.const";
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
import {
  toggleReaction as toggleReactionFn,
  getReactionCounts as getReactionCountsFn,
  getReactionsForComments as getReactionsForCommentsFn,
  removeReaction as removeReactionFn,
  type ToggleReactionResult,
} from "./reactions";

export type {
  DecodedCursor,
  UpsertRatingData,
  RatingResult,
  SnackRatingsResult,
  ToggleReactionResult,
};

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
      authorId: string;
      authorType: "user" | "guest";
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
        authorId: string;
        authorType: "user" | "guest";
      },
      tx?: DbTransaction,
    ): Promise<void> => {
      return removeRatingFn(db, data, tx);
    },

    getRatingsForSnack: (
      data: {
        snackItemId: string;
        authorId: string | null;
        authorType: "user" | "guest" | null;
      },
      tx?: DbTransaction,
    ): Promise<SnackRatingsResult> => {
      return getRatingsForSnackFn(db, data, tx);
    },

    listCommentsForSnack: async (
      data: {
        snackItemId: string;
        limit: number;
        cursor: DecodedCursor | null;
        userId?: string | null;
      },
      tx?: DbTransaction,
    ): Promise<SnackComment[]> => {
      const client = tx ?? db;
      const comments = await queryCommentsForSnack(client, data);
      if (comments.length === 0) return [] as SnackComment[];

      const commentIds = comments.map((c) => c.id);
      const reactionsMap = await getReactionsForCommentsFn(client, commentIds, data.userId ?? null);

      return comments.map((c) => {
        const entry = reactionsMap.get(c.id);
        return {
          ...c,
          reactions: (entry?.counts ?? {}) as Record<ReactionType, number>,
          userReaction: entry?.userReaction ?? null,
        };
      });
    },

    toggleReaction: (
      data: { commentId: string; userId: string; type: ReactionType },
      tx?: DbTransaction,
    ): Promise<ToggleReactionResult> => {
      return toggleReactionFn(db, data, tx);
    },

    getReactionCounts: (
      commentId: string,
      tx?: DbTransaction,
    ): Promise<Record<ReactionType, number>> => {
      const client = tx ?? db;
      return getReactionCountsFn(client, commentId);
    },

    getReactionsForComments: (commentIds: string[], userId: string | null, tx?: DbTransaction) => {
      const client = tx ?? db;
      return getReactionsForCommentsFn(client, commentIds, userId);
    },

    removeReaction: (
      data: { commentId: string; userId: string },
      tx?: DbTransaction,
    ): Promise<void> => {
      return removeReactionFn(db, data, tx);
    },
  };
}

export type CommentsRepository = ReturnType<typeof createCommentsRepository>;
