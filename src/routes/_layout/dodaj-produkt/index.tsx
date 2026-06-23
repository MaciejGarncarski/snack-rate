import { useMutation } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { toastManager } from "#/components/ui/toast";
import { CreateSnackForm } from "#/features/catalogue/create-snack/components/create-snack-form";
import { extractORPCError } from "#/lib/extract-orpc-error";
import { client, orpc } from "#/orpc/client";

export const Route = createFileRoute("/_layout/dodaj-produkt/")({
  component: RouteComponent,
  loader: async () => {
    const types = await client.listTypes();
    return { types };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { types } = Route.useLoaderData();

  const { mutate } = useMutation(
    orpc.createSnack.mutationOptions({
      onError: (mutationError) => {
        const errorMessage = extractORPCError(mutationError)?.message;

        if (!errorMessage) {
          toastManager.add({
            type: "error",
            title: "Wystąpił nieoczekiwany błąd",
          });
          return;
        }

        toastManager.add({
          type: "error",
          title: `Błąd: ${errorMessage}`,
        });
      },

      onSuccess: () => {
        toastManager.add({
          type: "success",
          title: "Produkt został dodany pomyślnie",
        });
        navigate({ to: "/" });
      },
    }),
  );

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const barcode = formData.get("barcode");
    const typeSlug = formData.get("typeSlug");

    const images: File[] = [];
    for (const [key, value] of formData.entries()) {
      if (key === "images" && value instanceof File) {
        images.push(value);
      }
    }

    await mutate({
      name: String(name),
      description: description ? String(description) : undefined,
      price: price ? Number(price) : undefined,
      barcode: barcode ? String(barcode) : undefined,
      typeSlug: typeSlug?.toString() || "",
      images,
    });
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Zaproponuj nowy produkt</h1>
      <CreateSnackForm onSubmit={handleSubmit} types={types} />
    </div>
  );
}
