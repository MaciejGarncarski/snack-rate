import { decodeCursor, slicePage } from "#/lib/cursor";

import type { RatingsRepository } from "../repositories/ratings.repository";

type ListSnackReviewsInput = {
  snackItemId: string;
  limit: number;
  cursor?: string | null;
};

export async function listSnackReviewsUseCase(
  input: ListSnackReviewsInput,
  repository: RatingsRepository,
) {
  const decodedCursor = input.cursor ? decodeCursor(input.cursor) : null;

  const pageItems = await repository.listReviewsForSnack({
    snackItemId: input.snackItemId,
    limit: input.limit + 1,
    cursor: decodedCursor,
  });

  return slicePage(pageItems, input.limit);
}
