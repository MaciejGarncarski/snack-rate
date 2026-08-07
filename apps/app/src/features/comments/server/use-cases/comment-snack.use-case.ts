import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { Rating } from "#/features/shared/value-objects/rating.vo";
import { type Database } from "#/infrastructure/db/db";
import { ratingsAddedCounter } from "#/observability/counters";

type RateSnackInput = {
  snackItemId: string;
  rating: number;
  body?: string | null;
  authorId: string;
  authorType: "user" | "guest";
};

function normalizeBody(body: string | null | undefined): string | null {
  if (body === null) return null;
  const trimmed = body?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

export function rateSnackUseCase(
  input: RateSnackInput,
  repository: CommentsRepository,
  db: Database,
) {
  const ratingVo = Rating.create(input.rating);
  const body = normalizeBody(input.body);

  return db.transaction(async (tx) => {
    const saved = await repository.upsertRating(
      {
        snackItemId: input.snackItemId,
        rating: ratingVo,
        body,
        authorId: input.authorId,
        authorType: input.authorType,
      },
      tx,
    );

    const ratings = await repository.getRatingsForSnack(
      {
        snackItemId: input.snackItemId,
        authorId: input.authorId,
        authorType: input.authorType,
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
        body: saved.body,
      },
      avgRating: ratings.avgRating,
      ratingCount: ratings.ratingCount,
      distribution: ratings.distribution,
    };
  });
}
