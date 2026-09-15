import { ORPCError } from "@orpc/client";

import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";

type EditReplyInput = {
  replyId: string;
  body: string;
  authorId: string;
};

export async function editReplyUseCase(input: EditReplyInput, repository: CommentsRepository) {
  const reply = await repository.getReplyById(input.replyId);

  if (!reply || reply.deletedAt !== null || reply.parentCommentId === null) {
    throw new ORPCError("NOT_FOUND", { message: "Odpowiedź nie została znaleziona." });
  }

  if (reply.authorId !== input.authorId) {
    throw new ORPCError("FORBIDDEN", {
      message: "Możesz edytować tylko własne odpowiedzi.",
    });
  }

  const body = input.body.trim();
  if (body.length === 0) {
    throw new ORPCError("BAD_REQUEST", { message: "Odpowiedź nie może być pusta." });
  }

  return repository.updateReplyBody({ replyId: input.replyId, body });
}
