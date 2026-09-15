import { decodeCursor, slicePage } from "#/lib/cursor";

import type { CommentsRepository } from "../repositories/comments.repository";

type ListCommentRepliesInput = {
  commentId: string;
  limit: number;
  cursor?: string | null;
  sessionUserId?: string | null;
  userId?: string | null;
};

export async function listCommentRepliesUseCase(
  input: ListCommentRepliesInput,
  repository: CommentsRepository,
) {
  const decodedCursor = input.cursor ? decodeCursor(input.cursor) : null;

  const pageItems = await repository.listRepliesForComment({
    commentId: input.commentId,
    limit: input.limit + 1,
    cursor: decodedCursor,
    userId: input.userId ?? null,
  });

  return slicePage(pageItems, input.limit);
}
