import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";

import { buildCreateSnackPayload } from "@/features/catalogue/create-snack/mutations/create-snack.mutation";
import { extractORPCError } from "@/lib/extract-orpc-error";
import { orpc } from "@/orpc/client";

export function useCreateSnack() {
  const navigate = useNavigate({ from: "/zaproponuj/" });

  const { mutateAsync } = useMutation(
    orpc.snacks.create.mutationOptions({
      onError: (mutationError) => {
        const errorMessage = extractORPCError(mutationError)?.message;
        toast.error(errorMessage ? `Błąd: ${errorMessage}` : "Wystąpił nieoczekiwany błąd");
      },

      onSuccess: ({ slug }, _vars, _result, context) => {
        context.client.invalidateQueries({ queryKey: orpc.snacks.list.key() });
        toast.success("Produkt został dodany pomyślnie");

        navigate({
          to: "/produkt/$slug",
          params: { slug },
        });
      },
    }),
  );

  const createSnack = async (formData: FormData) => {
    const payload = buildCreateSnackPayload(formData);
    // @ts-expect-error We need to expect error, because the payload cannot be typed correctly, because of interceptor.
    // We send form data as we should, the interceptor transforms images to image keys.
    // There is no way to type this correctly
    await mutateAsync(payload);
  };

  return {
    createSnack,
  };
}
