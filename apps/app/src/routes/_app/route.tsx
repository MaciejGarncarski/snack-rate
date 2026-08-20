import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as z from "zod";

import { AppLayout } from "#/components/layout/app-layout";
import { getSearchedItemsQueryOptions } from "#/features/catalogue/search-snacks/queries/get-searched-items.query-options";

const sharedParamsSchema = z.object({
  page: z.number().optional(),
  filter: z.string().optional(),
  sort: z.enum(["newest", "oldest", "highestRated", "lowestRated"]).optional(),
});

export const Route = createFileRoute("/_app")({
  component: RouteComponent,
  validateSearch: sharedParamsSchema,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getSearchedItemsQueryOptions(""));
  },
  notFoundComponent: () => <div>Nie znaleziono 1</div>,
});

function RouteComponent() {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
