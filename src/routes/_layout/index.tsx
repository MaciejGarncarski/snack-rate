import { createFileRoute } from "@tanstack/react-router";

import { SnacksList } from "#/features/snacks/components/snacks-list";

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
