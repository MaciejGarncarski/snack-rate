import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { ratingsRepository } from "#/features/ratings/server/repositories/ratings.repository.instance";
import { rateSnack } from "#/features/ratings/server/use-cases/rate-snack.use-case";
import { getSnackRatings } from "#/features/ratings/server/use-cases/snack-ratings.use-case";

const rateSnackInputSchema = z.object({
  snackItemId: z.uuid(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  guestId: z.string().optional(),
});

export const rateSnackFn = createServerFn()
  .validator(rateSnackInputSchema)
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

const getRatingsInputSchema = z.object({
  snackItemId: z.uuid(),
  guestId: z.string().optional(),
});

export const getRatingsForSnackFn = createServerFn({ method: "GET" })
  .validator(getRatingsInputSchema)
  .handler(({ data }) => {
    return getSnackRatings(
      {
        snackItemId: data.snackItemId,
        guestId: data.guestId ?? null,
      },
      ratingsRepository,
    );
  });
