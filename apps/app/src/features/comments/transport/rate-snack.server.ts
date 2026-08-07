import { ORPCError } from "@orpc/client";

import { verifyCaptcha } from "#/features/captcha/verify-captcha.server";
import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import { removeRatingUseCase } from "#/features/comments/server/use-cases/remove-comment.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { baseProcedure } from "#/lib/orpc/procedure";
import { rateSnackSchema, removeRatingSchema, snackRatingsSchema } from "#/schemas/comments";

function resolveAuthor(context: { userId: string | null; guestId: string | null }) {
  if (context.userId) return { authorId: context.userId, authorType: "user" as const };
  if (context.guestId) return { authorId: context.guestId, authorType: "guest" as const };
  throw new Error("No author identity available");
}

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
        ...resolveAuthor(context),
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
        ...resolveAuthor(context),
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
        ...resolveAuthor(context),
      },
      commentsRepository,
      getMainDb(),
    );
  });
