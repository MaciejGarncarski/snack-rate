import { createFileRoute } from "@tanstack/react-router";

import { CreateSnackForm } from "#/features/catalogue/create-snack/components/create-snack-form";
import { client } from "#/orpc/client";

export const Route = createFileRoute("/_layout/dodaj-produkt/")({
  component: RouteComponent,
  loader: async () => {
    const types = await client.snacks.listTypes();
    return { types };
  },
});

function RouteComponent() {
  const { types } = Route.useLoaderData();

  return (
    <div>
      <h1 className="mb-8 text-2xl font-bold">Zaproponuj nowy produkt</h1>
      <CreateSnackForm types={types} />
    </div>
  );
}
