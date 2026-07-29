import * as z from "zod";

export const rateSnackSchema = z.object({
  snackItemId: z.string().uuid(),
  rating: z.number().min(0.5).max(5).multipleOf(0.5),
  guestId: z.string().optional(),
});

export const snackRatingsSchema = z.object({
  snackItemId: z.string().uuid(),
  guestId: z.string().optional(),
});

export const removeRatingSchema = z.object({
  snackItemId: z.string(),
  guestId: z.string().optional(),
});
