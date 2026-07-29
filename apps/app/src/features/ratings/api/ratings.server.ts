import { createServerFn } from "@tanstack/react-start";

import { ratingsRepository } from "#/features/ratings/server/repositories/ratings.repository.instance";
import { rateSnack } from "#/features/ratings/server/use-cases/rate-snack.use-case";
import { getSnackRatings } from "#/features/ratings/server/use-cases/snack-ratings.use-case";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/ratings";

export const rateSnackFn = createServerFn()
  .validator(rateSnackSchema)
  .handler(({ data }) => {
    return rateSnack(
      {
        snackItemId: data.snackItemId,
        rating: data.rating,
        guestId: data.guestId ?? null,
      },
      ratingsRepository,
    );
  });

export const getRatingsForSnackFn = createServerFn({ method: "GET" })
  .validator(snackRatingsSchema)
  .handler(({ data }) => {
    return getSnackRatings(
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

    return ratingsRepository.removeRating({
      snackItemId: data.snackItemId,
      guestId: data.guestId ?? null,
      userId: null,
    });
  });
