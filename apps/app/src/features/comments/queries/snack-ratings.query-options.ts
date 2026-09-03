import { orpc } from "#/orpc/client";

export const snackRatingsQueryOptions = (snackItemId: string) =>
  orpc.comments.getRatings.queryOptions({
    input: { snackItemId },
    staleTime: 30_000,
  });
