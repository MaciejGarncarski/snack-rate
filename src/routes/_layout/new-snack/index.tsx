import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CreateSnackForm } from "#/features/catalogue/create-snack/components/create-snack-form";
import { client } from "#/orpc/client";

export const Route = createFileRoute("/_layout/new-snack/")({
  component: RouteComponent,
  loader: async () => {
    const types = await client.listTypes();
    return { types };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { types } = Route.useLoaderData();

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

    await client.createSnack({
      name: String(name),
      description: description ? String(description) : undefined,
      price: price ? Number(price) : undefined,
      barcode: barcode ? String(barcode) : undefined,
      typeSlug: typeSlug?.toString() || "",
      images,
    });

    navigate({ to: "/" });
  };

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">New Snack</h1>
      <CreateSnackForm onSubmit={handleSubmit} types={types} />
    </div>
  );
}
