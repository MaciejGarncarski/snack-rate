import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { snackCommentsQueryOptions } from "#/features/comments/queries/comments.query-options";
import { snackRatingsQueryOptions } from "#/features/comments/queries/snack-ratings.query-options";
import { orpc } from "#/orpc/client";

export function useCommentSnack() {
  return useMutation(
    orpc.comments.rate.mutationOptions({
      onError: (error) => {
        const message = error instanceof Error ? error.message : undefined;
        toast.error(message ?? "Nie udało się zapisać oceny");
      },
      onSuccess: async (_result, vars, _a, context) => {
        await Promise.all([
          context.client.invalidateQueries(snackRatingsQueryOptions(vars.snackItemId)),
          context.client.invalidateQueries(snackCommentsQueryOptions(vars.snackItemId)),
        ]);
        toast.success("Ocena została zapisana");
      },
    }),
  );
}
