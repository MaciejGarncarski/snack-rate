import { createServerFn } from "@tanstack/react-start";

import { ratingsRepository } from "#/features/ratings/server/repositories/ratings.repository.instance";
import { getSnackRatingsUseCase } from "#/features/ratings/server/use-cases/get-snack-rating.use-case";
import { rateSnackUseCase } from "#/features/ratings/server/use-cases/rate-snack.use-case";
import { removeRatingUseCase } from "#/features/ratings/server/use-cases/remove-rating.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/ratings";

export const rateSnackFn = createServerFn()
  .validator(rateSnackSchema)
  .handler(({ data }) => {
    return rateSnackUseCase(
      {
        snackItemId: data.snackItemId,
        rating: data.rating,
        body: data.body ?? null,
        guestId: data.guestId ?? null,
      },
      ratingsRepository,
      getMainDb(),
    );
  });

export const getRatingsForSnackFn = createServerFn({ method: "GET" })
  .validator(snackRatingsSchema)
  .handler(({ data }) => {
    return getSnackRatingsUseCase(
      {
        snackItemId: data.snackItemId,
        guestId: data.guestId ?? null,
      },
      ratingsRepository,
    );
  });

export const removeRatingFn = createServerFn({ method: "POST" })
  .validator(removeRatingSchema)
  .handler(({ data }) => {
    // TODO: Add userId support when we implement user authentication

    return removeRatingUseCase(
      {
        snackItemId: data.snackItemId,
        guestId: data.guestId ?? null,
      },
      ratingsRepository,
      getMainDb(),
    );
  });
