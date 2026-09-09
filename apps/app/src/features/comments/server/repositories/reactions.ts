import { commentReactions } from "@snack-rate/db-schema/schema";
import { and, eq, inArray, sql } from "drizzle-orm";

import type { ReactionType } from "#/features/comments/consts/reaction-type.const";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type ToggleReactionData = {
  commentId: string;
  userId: string;
  type: ReactionType;
};

export type ToggleReactionResult = {
  userReaction: ReactionType | null;
  counts: Record<ReactionType, number>;
};

export async function toggleReaction(
  db: Database,
  data: ToggleReactionData,
  tx?: DbTransaction,
): Promise<ToggleReactionResult> {
  const client = tx ?? db;

  const comment = await client.query.snackComments.findFirst({
    where: { id: data.commentId, deletedAt: { isNull: true } },
    columns: { id: true },
  });

  if (!comment) {
    throw new Error("Comment not found");
  }

  const existing = await client.query.commentReactions.findFirst({
    where: { userId: data.userId, commentId: data.commentId },
  });

  if (!existing) {
    await client.insert(commentReactions).values({
      userId: data.userId,
      commentId: data.commentId,
      type: data.type,
    });
  } else if (existing.type === data.type) {
    await client
      .delete(commentReactions)
      .where(
        and(
          eq(commentReactions.userId, data.userId),
          eq(commentReactions.commentId, data.commentId),
        ),
      );
  } else {
    await client
      .update(commentReactions)
      .set({ type: data.type })
      .where(
        and(
          eq(commentReactions.userId, data.userId),
          eq(commentReactions.commentId, data.commentId),
        ),
      );
  }

  const counts = await getReactionCounts(client, data.commentId);
  const updated = await client.query.commentReactions.findFirst({
    where: { userId: data.userId, commentId: data.commentId },
    columns: { type: true },
  });

  return {
    userReaction: (updated?.type as ReactionType | undefined) ?? null,
    counts,
  };
}

export async function getReactionCounts(
  client: Database | DbTransaction,
  commentId: string,
): Promise<Record<ReactionType, number>> {
  const rows = await client
    .select({
      type: commentReactions.type,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(commentReactions)
    .where(eq(commentReactions.commentId, commentId))
    .groupBy(commentReactions.type);

  const counts: Record<string, number> = {};
  for (const row of rows) {
    counts[row.type] = Number(row.count);
  }
  return counts as Record<ReactionType, number>;
}

export async function getReactionsForComments(
  client: Database | DbTransaction,
  commentIds: string[],
  userId: string | null,
): Promise<
  Map<string, { counts: Record<ReactionType, number>; userReaction: ReactionType | null }>
> {
  if (commentIds.length === 0) return new Map();

  const rows = await client
    .select({
      commentId: commentReactions.commentId,
      type: commentReactions.type,
      count: sql<number>`count(*)`.mapWith(Number),
    })
    .from(commentReactions)
    .where(inArray(commentReactions.commentId, commentIds))
    .groupBy(commentReactions.commentId, commentReactions.type);

  const countsByComment = new Map<string, Record<string, number>>();
  for (const row of rows) {
    const existing = countsByComment.get(row.commentId) ?? {};
    existing[row.type] = Number(row.count);
    countsByComment.set(row.commentId, existing);
  }

  let userReactions = new Map<string, string>();
  if (userId) {
    const userRows = await client
      .select({ commentId: commentReactions.commentId, type: commentReactions.type })
      .from(commentReactions)
      .where(
        and(inArray(commentReactions.commentId, commentIds), eq(commentReactions.userId, userId)),
      );
    for (const r of userRows) {
      userReactions.set(r.commentId, r.type);
    }
  }

  const result = new Map<
    string,
    { counts: Record<ReactionType, number>; userReaction: ReactionType | null }
  >();

  for (const id of commentIds) {
    result.set(id, {
      counts: (countsByComment.get(id) ?? {}) as Record<ReactionType, number>,
      userReaction: (userReactions.get(id) as ReactionType | undefined) ?? null,
    });
  }

  return result;
}

export async function removeReaction(
  db: Database,
  data: { commentId: string; userId: string },
  tx?: DbTransaction,
): Promise<void> {
  const client = tx ?? db;
  await client
    .delete(commentReactions)
    .where(
      and(eq(commentReactions.userId, data.userId), eq(commentReactions.commentId, data.commentId)),
    );
}
