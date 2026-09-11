import { ORPCError } from "@orpc/client";
import { ratelimit } from "@orpc/ratelimit";
import { MemoryRateLimiter } from "@orpc/ratelimit/memory";
import ms from "ms";

import { commentsRepository } from "#/features/comments/server/repositories/comments.repository.instance";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import { listSnackCommentsUseCase } from "#/features/comments/server/use-cases/list-snack-comments.use-case";
import {
  reactToCommentUseCase,
  removeReactionUseCase,
} from "#/features/comments/server/use-cases/react-to-comment.use-case";
import { removeRatingUseCase } from "#/features/comments/server/use-cases/remove-comment.use-case";
import { getMainDb } from "#/infrastructure/db/db";
import { verifyTurnstileToken } from "#/infrastructure/turnstile";
import { baseProcedure } from "#/lib/orpc/procedure";
import { listCommentsSchema } from "#/schemas/comments";
import {
  rateSnackSchema,
  reactToCommentSchema,
  removeRatingSchema,
  removeReactionSchema,
  snackRatingsSchema,
} from "#/schemas/comments";

const RATE_LIMIT = 30;
const RATE_LIMIT_WINDOW_MS = ms("1h");

const commentRateLimiter = new MemoryRateLimiter({
  maxRequests: RATE_LIMIT,
  window: RATE_LIMIT_WINDOW_MS,
});

type AuthorContext = { userId: string | null; guestId: string | null };

function resolveAuthor(context: AuthorContext) {
  if (context.userId) return { authorId: context.userId, authorType: "user" as const };
  if (context.guestId) return { authorId: context.guestId, authorType: "guest" as const };
  throw new Error("No author identity available");
}

function authorKey(context: AuthorContext): string {
  return resolveAuthor(context).authorId;
}

export const listCommentsProcedure = baseProcedure
  .input(listCommentsSchema)
  .handler(({ input, context }) => {
    return listSnackCommentsUseCase(
      {
        snackItemId: input.snackItemId,
        limit: input.limit,
        cursor: input.cursor,
        userId: context.userId,
      },
      commentsRepository,
    );
  });

export const rateSnackProcedure = baseProcedure
  .input(rateSnackSchema)
  .use(
    ratelimit({
      limiter: () => commentRateLimiter,
      key: ({ context }) => `comments.rate:${authorKey(context)}`,
    }),
  )
  .handler(async ({ input, context }) => {
    const isVerified = await verifyTurnstileToken({
      token: input.token ?? "",
    });

    if (!isVerified) {
      throw new ORPCError("BAD_REQUEST", {
        message: "Nie udało się zweryfikować użytkownika",
        cause: "Turnstile token verification failed",
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
  .use(
    ratelimit({
      limiter: () => commentRateLimiter,
      key: ({ context }) => `comments.removeRating:${authorKey(context)}`,
    }),
  )
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

const reactionRateLimiter = new MemoryRateLimiter({
  maxRequests: 60,
  window: ms("1h"),
});

export const reactToCommentProcedure = baseProcedure
  .input(reactToCommentSchema)
  .use(
    ratelimit({
      limiter: () => reactionRateLimiter,
      key: ({ context }) => `comments.react:${context.userId ?? context.guestId ?? "anon"}`,
    }),
  )
  .handler(({ input, context }) => {
    return reactToCommentUseCase(
      {
        commentId: input.commentId,
        type: input.type,
        userId: context.userId,
      },
      commentsRepository,
    );
  });

export const removeReactionProcedure = baseProcedure
  .input(removeReactionSchema)
  .use(
    ratelimit({
      limiter: () => reactionRateLimiter,
      key: ({ context }) =>
        `comments.removeReaction:${context.userId ?? context.guestId ?? "anon"}`,
    }),
  )
  .handler(({ input, context }) => {
    return removeReactionUseCase(
      {
        commentId: input.commentId,
        userId: context.userId,
      },
      commentsRepository,
    );
  });
