import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";

type GetSnackRatingsInput = {
  snackItemId: string;
  authorId: string | null;
  authorType: "user" | "guest" | null;
};

export function getSnackRatingsUseCase(
  input: GetSnackRatingsInput,
  repository: CommentsRepository,
) {
  return repository.getRatingsForSnack({
    snackItemId: input.snackItemId,
    authorId: input.authorId,
    authorType: input.authorType,
  });
}
