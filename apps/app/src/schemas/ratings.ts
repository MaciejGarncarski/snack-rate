import * as z from "zod";

export const MAXIMUM_REVIEW_BODY_LENGTH = 500;

export const rateSnackSchema = z.object({
  snackItemId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(MAXIMUM_REVIEW_BODY_LENGTH).optional().nullable(),
  guestId: z.string().optional(),
});

export const snackRatingsSchema = z.object({
  snackItemId: z.uuid(),
  guestId: z.string().optional(),
});

export const removeRatingSchema = z.object({
  snackItemId: z.uuid(),
  guestId: z.string().optional(),
});
