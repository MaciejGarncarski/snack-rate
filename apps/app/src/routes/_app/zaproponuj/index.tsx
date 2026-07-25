import { createFileRoute } from "@tanstack/react-router";

import { CreateSnackForm } from "#/features/catalogue/create-snack/components/create-snack-form";
import { client } from "#/orpc/client";

export const Route = createFileRoute("/_app/zaproponuj/")({
  component: RouteComponent,
  loader: async () => {
    const types = await client.snacks.listTypes();
    return { types };
  },
});

function RouteComponent() {
  const { types } = Route.useLoaderData();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 pb-10">
      <header className="relative py-4">
        <div className="relative max-w-xl">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Zaproponuj nowy produkt
          </h2>
          <p className="mt-3 max-w-lg text-pretty leading-relaxed text-muted-foreground">
            Masz coś wartego polecenia? Wypełnij trzy krótkie kroki, a my zajmiemy się resztą.
          </p>
        </div>
      </header>
      <CreateSnackForm types={types} />
    </div>
  );
}
