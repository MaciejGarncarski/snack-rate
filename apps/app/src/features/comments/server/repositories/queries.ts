import { desc } from "drizzle-orm";

import type { SnackComment, SnackReply } from "#/features/comments/contracts/comments";
import type { Database, DbTransaction } from "#/infrastructure/db/db";

export type DecodedCursor = {
  createdAt: Date;
  id: string;
};

function resolveAuthorName(name: string | null): string {
  return name?.trim() || "Gość";
}

export async function queryCommentsForSnack(
  client: Database | DbTransaction,
  data: {
    snackItemId: string;
    userId: string | null;
    limit: number;
    cursor: DecodedCursor | null;
  },
): Promise<Omit<SnackComment, "reactions" | "userReaction">[]> {
  const commentRows = await client.query.snackComments.findMany({
    where: {
      AND: [
        { snackItemId: data.snackItemId },
        { parentCommentId: { isNull: true } },
        { rating: { isNotNull: true } },
        { deletedAt: { isNull: true } },
        ...(data.cursor
          ? [
              {
                OR: [
                  { createdAt: { eq: data.cursor.createdAt }, id: { lt: data.cursor.id } },
                  { createdAt: { lt: data.cursor.createdAt } },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: (table) => [desc(table.createdAt), desc(table.id)],
    limit: data.limit,
    columns: {
      id: true,
      rating: true,
      body: true,
      authorId: true,
      authorType: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      author: {
        columns: { name: true },
      },
    },
  });

  return commentRows.map((row) => {
    return {
      id: row.id,
      rating: row.rating ?? 0,
      body: row.body,
      authorName: row.authorType === "user" ? resolveAuthorName(row.author?.name ?? null) : "Gość",
      isUserAuthor: row.authorId === data.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isEdited: row.updatedAt.getTime() > row.createdAt.getTime(),
      hasReplies: true,
    };
  });
}

export async function queryRepliesForComment(
  client: Database | DbTransaction,
  data: {
    commentId: string;
    userId: string | null;
    limit: number;
    cursor: DecodedCursor | null;
  },
): Promise<SnackReply[]> {
  const replyRows = await client.query.snackComments.findMany({
    where: {
      AND: [
        { parentCommentId: data.commentId },
        { deletedAt: { isNull: true } },
        ...(data.cursor
          ? [
              {
                OR: [
                  { createdAt: { eq: data.cursor.createdAt }, id: { lt: data.cursor.id } },
                  { createdAt: { lt: data.cursor.createdAt } },
                ],
              },
            ]
          : []),
      ],
    },
    orderBy: (table) => [desc(table.createdAt), desc(table.id)],
    limit: data.limit,
    columns: {
      id: true,
      body: true,
      authorId: true,
      authorType: true,
      createdAt: true,
      updatedAt: true,
    },
    with: {
      author: {
        columns: { name: true },
      },
    },
  });

  return replyRows.map((row) => {
    return {
      id: row.id,
      body: row.body,
      authorName: row.authorType === "user" ? resolveAuthorName(row.author?.name ?? null) : "Gość",
      isUserAuthor: row.authorId === data.userId,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      isEdited: row.updatedAt.getTime() > row.createdAt.getTime(),
    };
  });
}
