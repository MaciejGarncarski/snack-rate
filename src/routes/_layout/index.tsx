import { createFileRoute } from "@tanstack/react-router";

import { SnacksList } from "#/features/catalogue/components/snacks-list";
import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
  loader: ({ context: { queryClient } }) => {
    queryClient.ensureInfiniteQueryData(listSnacksQueryOptions());
  },
  pendingComponent: () => (
    <div className="flex h-full w-full items-center justify-center">Loading</div>
  ),
});

function RouteComponent() {
  return (
    <div>
      <SnacksList />
    </div>
  );
}
