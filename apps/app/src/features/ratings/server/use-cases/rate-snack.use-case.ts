import type { RatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { Rating } from "#/features/shared/value-objects/rating.vo";
import { type Database } from "#/infrastructure/db/db";
import { ratingsAddedCounter } from "#/observability/counters";

type RateSnackInput = {
  snackItemId: string;
  rating: number;
  userId?: string | null;
  guestId?: string | null;
};

export function rateSnackUseCase(
  input: RateSnackInput,
  repository: RatingsRepository,
  db: Database,
) {
  if (!input.userId && !input.guestId) {
    throw new Error("Either userId or guestId must be provided");
  }

  const ratingVo = Rating.create(input.rating);

  return db.transaction(async (tx) => {
    const saved = await repository.upsertRating(
      {
        snackItemId: input.snackItemId,
        rating: ratingVo,
        userId: input.userId ?? null,
        guestId: input.guestId ?? null,
      },
      tx,
    );

    const ratings = await repository.getRatingsForSnack(
      {
        snackItemId: input.snackItemId,
        userId: null,
        guestId: input.guestId ?? null,
      },
      tx,
    );

    await repository.recalculateAvgRating(input.snackItemId, tx);

    ratingsAddedCounter.add(1, {
      "rating.value": String(ratingVo.getValue()),
    });

    return {
      rating: {
        id: saved.id,
        value: saved.rating,
      },
      avgRating: ratings.avgRating,
      ratingCount: ratings.ratingCount,
      distribution: ratings.distribution,
    };
  });
}
