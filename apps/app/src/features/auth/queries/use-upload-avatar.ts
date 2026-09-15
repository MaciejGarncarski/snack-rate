import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { sessionQueryOptions } from "#/features/auth/queries/session.query-options";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { orpc } from "#/orpc/client";

export function useUploadAvatar() {
  return useMutation(
    orpc.auth.uploadAvatar.mutationOptions({
      onError: (mutationError) => {
        toast.error(
          extractORPCError(mutationError)?.message ??
            "Nie udało się przesłać avatara. Spróbuj ponownie.",
        );
      },
      onSuccess: (_result, _vars, _a, context) => {
        void context.client.invalidateQueries(sessionQueryOptions());
        toast.success("Avatar został zaktualizowany");
      },
    }),
  );
}
