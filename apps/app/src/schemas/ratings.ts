import * as z from "zod";

export const MAXIMUM_REVIEW_BODY_LENGTH = 500;

export const rateSnackSchema = z.object({
  snackItemId: z.uuid(),
  rating: z.number().int().min(1).max(5),
  body: z.string().max(MAXIMUM_REVIEW_BODY_LENGTH).optional().nullable(),
  guestId: z.string().optional(),
  captchaCode: z.string().length(5),
});

export const rateSnackFormSchema = z
  .object({
    rating: z.number().int().min(1).max(5).nullable(),
    body: z.string().max(MAXIMUM_REVIEW_BODY_LENGTH, "Opinia jest za długa"),
    captchaCode: z.string().length(5, "Wpisz 5-znakowy kod z obrazka"),
  })
  .superRefine((value, ctx) => {
    if (value.rating === null) {
      ctx.addIssue({
        code: "custom",
        message: "Wybierz ocenę gwiazdkową",
        path: ["rating"],
      });
    }
  });

export const snackRatingsSchema = z.object({
  snackItemId: z.uuid(),
  guestId: z.string().optional(),
});

export const removeRatingSchema = z.object({
  snackItemId: z.uuid(),
  guestId: z.string().optional(),
});

export const listReviewsSchema = z.object({
  snackItemId: z.uuid(),
  limit: z.number().int().min(1).max(50),
  cursor: z.string().optional(),
});
