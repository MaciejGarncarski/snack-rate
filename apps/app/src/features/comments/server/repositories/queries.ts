import { snackComments, users } from "@snack-rate/db-schema/schema";
import { and, asc, desc, eq, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";

import type { SnackComment, SnackCommentReply } from "#/features/comments/contracts/comments";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

function resolveAuthorName(firstName: string | null, lastName: string | null): string {
  const name = [firstName, lastName].filter(Boolean).join(" ").trim();
  return name || "Gość";
}

export async function queryCommentsForSnack(
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
