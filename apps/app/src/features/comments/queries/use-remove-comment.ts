import { useMutation } from "@tanstack/react-query";
import type z from "zod";

import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query-options";
import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { removeRatingFn } from "#/features/comments/transport/rate-snack.server";
import type { removeRatingSchema } from "#/schemas/comments";

export function useRemoveComment({
  snackItemId,
  guestId,
  slug,
}: {
  snackItemId: string;
  guestId: string;
  slug: string;
}) {
  return useMutation({
    mutationFn: (mutationData: z.input<typeof removeRatingSchema>) => {
      return removeRatingFn({ data: mutationData });
    },
    onSuccess: async (_, __, ___, { client }) => {
      await Promise.all([
        client.invalidateQueries(snackRatingsQueryOptions(snackItemId, guestId)),
        client.invalidateQueries(getSnackBySlugQueryOptions(slug)),
        client.invalidateQueries(snackCommentsQueryOptions(snackItemId)),
      ]);
    },
  });
}
