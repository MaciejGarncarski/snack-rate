import { orpc } from "#/orpc/client";

export const snackRatingDataQueryOptions = (snackItemId: string) =>
  orpc.comments.getRatings.queryOptions({
    input: { snackItemId },
    staleTime: 30_000,
  });
