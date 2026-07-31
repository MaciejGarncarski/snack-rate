import * as z from "zod";

export const rateSnackSchema = z.object({
  snackItemId: z.uuid(),
  rating: z.number().int().min(1).max(5),
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
