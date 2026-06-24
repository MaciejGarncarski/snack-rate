import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";

import { toastManager } from "#/components/ui/toast";
import { buildCreateSnackPayload } from "#/features/catalogue/create-snack/mutations/create-snack.mutation";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { orpc } from "#/orpc/client";

export function useCreateSnack() {
  const navigate = useNavigate({ from: "/dodaj-produkt/" });

  const { mutate } = useMutation(
    orpc.snacks.create.mutationOptions({
      onError: (mutationError) => {
        const errorMessage = extractORPCError(mutationError)?.message;

        toastManager.add({
          type: "error",
          title: errorMessage ? `Błąd: ${errorMessage}` : "Wystąpił nieoczekiwany błąd",
        });
      },

      onSuccess: ({ slug }, _vars, _result, context) => {
        context.client.invalidateQueries({ queryKey: orpc.snacks.list.key() });

        toastManager.add({
          type: "success",
          title: "Produkt został dodany pomyślnie",
        });

        navigate({
          to: "/produkt/$slug",
          params: { slug },
        });
      },
    }),
  );

  const createSnack = (formData: FormData) => {
    const payload = buildCreateSnackPayload(formData);
    mutate(payload);
  };

  return {
    createSnack,
  };
}
