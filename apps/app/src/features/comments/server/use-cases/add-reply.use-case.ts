import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";

type AddReplyInput = {
  snackItemId: string;
  commentId: string;
  body: string;
  authorId: string;
  authorType: "user" | "guest";
};

export function addReplyUseCase(input: AddReplyInput, repository: CommentsRepository) {
  return repository.addReply({
    snackItemId: input.snackItemId,
    authorId: input.authorId,
    authorType: input.authorType,
    commentId: input.commentId.toString(),
    body: input.body,
  });
}
