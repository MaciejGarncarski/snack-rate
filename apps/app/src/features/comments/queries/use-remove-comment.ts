import { useMutation } from "@tanstack/react-query";

import { getSnackBySlugQueryOptions } from "#/features/catalogue/queries/get-snack-by-slug.query-options";
import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";
import { snackRatingDataQueryOptions as snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { orpc } from "#/orpc/client";

export function useRemoveComment({ snackItemId, slug }: { snackItemId: string; slug: string }) {
  return useMutation(
    orpc.comments.removeRating.mutationOptions({
      onSuccess: async (_result, _vars, _a, context) => {
        await Promise.all([
          context.client.invalidateQueries(snackRatingsQueryOptions(snackItemId)),
          context.client.invalidateQueries(getSnackBySlugQueryOptions(slug)),
          context.client.invalidateQueries(snackCommentsQueryOptions(snackItemId)),
        ]);
      },
    }),
  );
}
