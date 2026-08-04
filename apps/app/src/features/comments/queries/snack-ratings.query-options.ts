import { queryOptions } from "@tanstack/react-query";

import { getRatingsForSnackFn } from "#/features/comments/transport/rate-snack.server";

export const snackRatingsQueryOptions = (snackItemId: string, guestId: string | undefined) =>
  queryOptions({
    queryKey: ["snackRatings", snackItemId, guestId],
    queryFn: () => {
      return getRatingsForSnackFn({
        data: { snackItemId, guestId },
      });
    },
    staleTime: 30_000,
    enabled: !!snackItemId,
  });
