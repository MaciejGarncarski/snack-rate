import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";

import { SnacksList } from "@/features/catalogue/components/snacks-list";
import { SnacksListSkeleton } from "@/features/catalogue/components/snacks-list-skeleton";
import { listSnacksQueryOptions } from "@/features/catalogue/queries/list-snacks.query";

export const Route = createFileRoute("/_layout/")({
  component: RouteComponent,
  loader: ({ context }: { context: { queryClient: QueryClient } }) => {
    context.queryClient.ensureInfiniteQueryData(listSnacksQueryOptions());
  },
  pendingComponent: () => <SnacksListSkeleton />,
});

function RouteComponent() {
  return (
    <div>
      <SnacksList />
    </div>
  );
}
