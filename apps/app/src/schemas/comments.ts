import * as z from "zod";

import { REACTION_TYPES } from "#/features/comments/consts/reaction-type.const";

export const MAXIMUM_COMMENT_BODY_LENGTH = 500;

export const rateSnackSchema = z.object({
  snackItemId: z.uuid(),
  rating: z.number().int().min(1).max(10),
  body: z.string().max(MAXIMUM_COMMENT_BODY_LENGTH).optional().nullable(),
  token: z.string().optional(),
});

export const rateSnackFormSchema = z
  .object({
    rating: z.number().int().min(1).max(10).nullable(),
    body: z.string().max(MAXIMUM_COMMENT_BODY_LENGTH, "Opinia jest za długa"),
  })
  .superRefine((value, ctx) => {
    if (value.rating === null) {
      ctx.addIssue({
        code: "custom",
        message: "Wybierz ocenę",
        path: ["rating"],
      });
    }
  });

export const snackRatingsSchema = z.object({
  snackItemId: z.uuid(),
});

export const removeRatingSchema = z.object({
  snackItemId: z.uuid(),
});

export const listCommentsSchema = z.object({
  snackItemId: z.uuid(),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional(),
});

export const reactToCommentSchema = z.object({
  commentId: z.uuid(),
  type: z.enum(REACTION_TYPES),
});

export const removeReactionSchema = z.object({
  commentId: z.uuid(),
});
