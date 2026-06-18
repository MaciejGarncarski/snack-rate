import { createFileRoute } from "@tanstack/react-router";

import { SnacksList } from "#/features/catalogue/components/snacks-list";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <SnacksList />
    </div>
  );
}
