import { queryOptions } from "@tanstack/react-query";

import { client } from "#/orpc/client";

export const snackRatingsQueryOptions = (snackItemId: string) =>
  queryOptions({
    queryKey: ["snackRatings", snackItemId],
    queryFn: () => {
      return client.comments.getRatings({ snackItemId });
    },
    staleTime: 30_000,
    enabled: !!snackItemId,
  });
