import { ORPCError } from "@orpc/client";
import { os } from "@orpc/server";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import { removeRatingUseCase } from "#/features/comments/server/use-cases/remove-comment.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/comments";

export const rateSnackProcedure = os.input(rateSnackSchema).handler(({ input }) => {
  if (!verifyCaptcha(input.captchaCode)) {
    throw new ORPCError("BAD_REQUEST", {
      message: "Nieprawidłowy kod captcha. Spróbuj odświeżyć obrazek.",
    });
  }

  return rateSnackUseCase(
    {
      snackItemId: input.snackItemId,
      rating: input.rating,
      body: input.body ?? null,
      guestId: input.guestId ?? null,
    },
    commentsRepository,
    getMainDb(),
  );
});

export const getRatingsForSnackProcedure = os.input(snackRatingsSchema).handler(({ input }) => {
  return getSnackRatingsUseCase(
    {
      snackItemId: input.snackItemId,
      guestId: input.guestId ?? null,
    },
    commentsRepository,
  );
});

export const removeRatingProcedure = os.input(removeRatingSchema).handler(({ input }) => {
  return removeRatingUseCase(
    {
      snackItemId: input.snackItemId,
      guestId: input.guestId ?? null,
    },
    commentsRepository,
    getMainDb(),
  );
});
