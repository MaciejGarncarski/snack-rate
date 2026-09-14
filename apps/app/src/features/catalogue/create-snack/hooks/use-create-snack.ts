import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { buildCreateSnackPayload } from "#/features/catalogue/create-snack/mutations/create-snack.mutation";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { orpc } from "#/orpc/client";

export function useCreateSnack() {
  const { mutateAsync } = useMutation(
    orpc.snacks.create.mutationOptions({
      onError: (mutationError) => {
        const errorMessage = extractORPCError(mutationError)?.message;
        toast.error(errorMessage ? errorMessage : "Wystąpił nieoczekiwany błąd");
      },

      onSuccess: (_, _vars, _result, context) => {
        context.client.invalidateQueries({ queryKey: orpc.snacks.list.key() });
        toast.success("Produkt został dodany pomyślnie");
      },
    }),
  );

  const createSnack = async (formData: FormData, token?: string) => {
    const payload = { ...buildCreateSnackPayload(formData), token };
    await mutateAsync(payload);
  };

  return {
    createSnack,
  };
}
