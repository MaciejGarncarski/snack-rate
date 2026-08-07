import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import type { Database } from "#/infrastructure/db/db";
import { ratingsRemovedCounter } from "#/observability/counters";

type RemoveRatingInput = {
  snackItemId: string;
  authorId: string;
  authorType: "user" | "guest";
};

export function removeRatingUseCase(
  input: RemoveRatingInput,
  repository: CommentsRepository,
  db: Database,
) {
  return db.transaction(async (tx) => {
    await repository.removeRating({
      snackItemId: input.snackItemId,
      authorId: input.authorId,
      authorType: input.authorType,
    });

    await repository.recalculateAvgRating(input.snackItemId, tx);

    ratingsRemovedCounter.add(1);
  });
}
