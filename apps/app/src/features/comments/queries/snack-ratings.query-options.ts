import { queryOptions } from "@tanstack/react-query";

import { client } from "#/orpc/client";

export const snackRatingsQueryOptions = (snackItemId: string, guestId: string | undefined) =>
  queryOptions({
    queryKey: ["snackRatings", snackItemId, guestId],
    queryFn: () => {
      return client.comments.getRatings({ snackItemId, guestId });
    },
    staleTime: 30_000,
    enabled: !!snackItemId,
  });
