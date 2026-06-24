import { os } from "@orpc/server";
import * as z from "zod";


const listReviewsInputSchema = z.object({
  limit: z.number().min(1).max(100).default(20),
  cursor: z.string().optional(),
  snackSlug: z.string(),
});


export const listReviews = os.input(listReviewsInputSchema).handler(({ input }) => {
  const { limit, cursor, snackSlug } = input;

  return getSnackReviews({ limit, cursor, snackSlug }, reviewsRepository);
});
