import { CreateSnackForm } from "#/features/catalogue/create-snack/components/create-snack-form";
import { client } from "#/orpc/client";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_layout/zaproponuj/")({
  component: RouteComponent,
  loader: async () => {
    const types = await client.snacks.listTypes();
    return { types };
  },
});

function RouteComponent() {
  const { types } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4">
      <h1 className="mb-8 text-2xl font-bold">Zaproponuj nowy produkt</h1>
      <CreateSnackForm types={types} />
    </div>
  );
}
