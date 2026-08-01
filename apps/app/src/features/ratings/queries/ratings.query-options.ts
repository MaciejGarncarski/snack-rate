import { queryOptions, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

import { getRatingsForSnackFn, rateSnackFn } from "#/features/ratings/transport/ratings.server";
import { rateSnackSchema } from "#/schemas/ratings";

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

export function useRateSnack() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vars: z.input<typeof rateSnackSchema>) => rateSnackFn({ data: vars }),
    onError: (error) => {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message ?? "Nie udało się zapisać oceny");
    },
    onSuccess: (result, vars) => {
      const guestId = vars.guestId;
      queryClient.setQueryData(["snackRatings", vars.snackItemId, guestId], (old: unknown) => {
        if (old && typeof old === "object" && "avgRating" in old) {
          return {
            ...old,
            avgRating: result.avgRating,
            ratingCount: result.ratingCount,
            distribution: result.distribution,
            userRating: result.rating.value,
            userBody: result.rating.body,
          };
        }
        return {
          avgRating: result.avgRating,
          ratingCount: result.ratingCount,
          distribution: result.distribution,
          userRating: result.rating.value,
          userBody: result.rating.body,
        };
      });
      toast.success("Ocena została zapisana");
    },
  });
}
