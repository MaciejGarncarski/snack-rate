import { os } from "@orpc/server";

import { ratingsRepository } from "#/features/ratings/server/repositories/ratings.repository.instance";
import { listSnackReviewsUseCase } from "#/features/ratings/server/use-cases/list-snack-reviews.use-case";
import { listReviewsSchema } from "#/schemas/ratings";

export const listReviewsProcedure = os.input(listReviewsSchema).handler(({ input }) => {
  return listSnackReviewsUseCase(
    {
      snackItemId: input.snackItemId,
      limit: input.limit,
      cursor: input.cursor,
    },
    ratingsRepository,
  );
});
