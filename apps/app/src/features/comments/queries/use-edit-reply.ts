import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { commentRepliesQueryOptions } from "#/features/comments/queries/comments.query-options";
import { orpc } from "#/orpc/client";

export function useEditReply({ parentCommentId }: { parentCommentId: string }) {
  return useMutation(
    orpc.comments.editReply.mutationOptions({
      onError: (error) => {
        const message = error instanceof Error ? error.message : undefined;
        toast.error(message ?? "Nie udało się zapisać odpowiedzi");
      },
      onSuccess: (_result, _vars, _a, context) => {
        void context.client.invalidateQueries(commentRepliesQueryOptions(parentCommentId));
        toast.success("Odpowiedź została zaktualizowana");
      },
    }),
  );
}
