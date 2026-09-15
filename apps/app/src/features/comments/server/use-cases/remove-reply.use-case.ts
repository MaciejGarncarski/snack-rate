import { ORPCError } from "@orpc/client";

import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";

type RemoveReplyInput = {
  replyId: string;
  authorId: string;
};

export async function removeReplyUseCase(input: RemoveReplyInput, repository: CommentsRepository) {
  const reply = await repository.getReplyById(input.replyId);

  if (!reply || reply.deletedAt !== null || reply.parentCommentId === null) {
    throw new ORPCError("NOT_FOUND", { message: "Odpowiedź nie została znaleziona." });
  }

  if (reply.authorId !== input.authorId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Możesz usuwać tylko własne odpowiedzi.",
    });
  }

  await repository.softDeleteReply(input.replyId);
}
