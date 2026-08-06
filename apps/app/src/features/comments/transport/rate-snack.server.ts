import { ORPCError } from "@orpc/client";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import { removeRatingUseCase } from "#/features/comments/server/use-cases/remove-comment.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { baseProcedure } from "#/lib/orpc/procedure";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/comments";

export const rateSnackProcedure = baseProcedure
  .input(rateSnackSchema)
  .handler(({ input, context }) => {
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
        guestId: context.guestId,
      },
      commentsRepository,
      getMainDb(),
    );
  });

export const getRatingsForSnackProcedure = baseProcedure
  .input(snackRatingsSchema)
  .handler(({ input, context }) => {
    return getSnackRatingsUseCase(
      {
        snackItemId: input.snackItemId,
        guestId: context.guestId,
      },
      commentsRepository,
    );
  });

export const removeRatingProcedure = baseProcedure
  .input(removeRatingSchema)
  .handler(({ input, context }) => {
    return removeRatingUseCase(
      {
        snackItemId: input.snackItemId,
        guestId: context.guestId,
      },
      commentsRepository,
      getMainDb(),
    );
  });
