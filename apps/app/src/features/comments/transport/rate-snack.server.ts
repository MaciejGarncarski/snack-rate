import { ORPCError } from "@orpc/client";
import { createServerFn } from "@tanstack/react-start";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import { removeRatingUseCase } from "#/features/comments/server/use-cases/remove-comment.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/comments";

export const rateSnackFn = createServerFn()
  .validator(rateSnackSchema)
  .handler(({ data }) => {
    if (!verifyCaptcha(data.captchaCode)) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nieprawidłowy kod captcha. Spróbuj odświeżyć obrazek.",
      });
    }

    return rateSnackUseCase(
      {
        snackItemId: data.snackItemId,
        rating: data.rating,
        body: data.body ?? null,
        guestId: data.guestId ?? null,
      },
      commentsRepository,
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
      commentsRepository,
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
      commentsRepository,
      getMainDb(),
    );
  });
