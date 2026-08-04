import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import * as z from "zod";

import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { rateSnackFn } from "#/features/comments/transport/rate-snack.server";
import { rateSnackSchema } from "#/schemas/comments";

export function useCommentSnack() {
  return useMutation({
    mutationFn: (vars: z.input<typeof rateSnackSchema>) => rateSnackFn({ data: vars }),
    onError: (error) => {
      const message = error instanceof Error ? error.message : undefined;
      toast.error(message ?? "Nie udało się zapisać oceny");
    },
    onSuccess: async (_result, vars, ___, { client }) => {
      await Promise.all([
        client.invalidateQueries(snackRatingsQueryOptions(vars.snackItemId, vars.guestId)),
        client.invalidateQueries(snackCommentsQueryOptions(vars.snackItemId)),
      ]);
      toast.success("Ocena została zapisana");
    },
  });
}
