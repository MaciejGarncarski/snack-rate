import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { CreateSnackForm } from "#/features/catalogue/components/create-snack-form";
import { client } from "#/orpc/client";

export const Route = createFileRoute("/_layout/new-snack/")({
  component: RouteComponent,
  loader: async () => {
    const [brands, types] = await Promise.all([client.listBrands(), client.listTypes()]);
    return { brands, types };
  },
});

function RouteComponent() {
  const navigate = useNavigate();
  const { brands, types } = Route.useLoaderData();

  const handleSubmit = async (formData: FormData) => {
    const name = formData.get("name");
    const description = formData.get("description");
    const price = formData.get("price");
    const barcode = formData.get("barcode");
    const brandId = formData.get("brandId");
    const typeId = formData.get("typeId");

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
      brandId: brandId ? String(brandId) : undefined,
      typeId: typeId ? String(typeId) : undefined,
      images,
    });

    navigate({ to: "/" });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-8 text-2xl font-bold">New Snack</h1>
      <CreateSnackForm onSubmit={handleSubmit} brands={brands} types={types} />
    </div>
  );
}
