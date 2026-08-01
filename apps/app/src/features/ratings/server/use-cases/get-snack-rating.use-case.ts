import type { RatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";

type GetSnackRatingsInput = {
  snackItemId: string;
  userId?: string | null;
  guestId?: string | null;
};

export function getSnackRatingsUseCase(input: GetSnackRatingsInput, repository: RatingsRepository) {
  return repository.getRatingsForSnack({
    snackItemId: input.snackItemId,
    userId: input.userId ?? null,
    guestId: input.guestId ?? null,
  });
}
