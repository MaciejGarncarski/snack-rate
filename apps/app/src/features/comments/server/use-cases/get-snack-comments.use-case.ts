import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";

type GetSnackRatingsInput = {
  snackItemId: string;
  userId?: string | null;
  guestId?: string | null;
};

export function getSnackRatingsUseCase(
  input: GetSnackRatingsInput,
  repository: CommentsRepository,
) {
  return repository.getRatingsForSnack({
    snackItemId: input.snackItemId,
    userId: input.userId ?? null,
    guestId: input.guestId ?? null,
  });
}
