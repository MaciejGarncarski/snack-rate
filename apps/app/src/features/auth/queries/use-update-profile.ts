import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { sessionQueryOptions } from "#/features/auth/queries/session.query-options";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { orpc } from "#/orpc/client";

export function useUpdateProfile() {
  return useMutation(
    orpc.auth.updateProfile.mutationOptions({
      onError: (mutationError) => {
        toast.error(
          extractORPCError(mutationError)?.message ??
            "Nie udało się zapisać nazwy. Spróbuj ponownie.",
        );
      },
      onSuccess: (_result, _vars, _a, context) => {
        void context.client.invalidateQueries(sessionQueryOptions());
        toast.success("Nazwa została zaktualizowana");
      },
    }),
  );
}
