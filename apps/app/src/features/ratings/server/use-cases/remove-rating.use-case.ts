import type { RatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";

type RemoveRatingInput = {
  snackItemId: string;
  userId?: string | null;
  guestId?: string | null;
};

export function removeRatingUseCase(input: RemoveRatingInput, repository: RatingsRepository) {
  return repository.removeRating({
    snackItemId: input.snackItemId,
    userId: input.userId ?? null,
    guestId: input.guestId ?? null,
  });
}
