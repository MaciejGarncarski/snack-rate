import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as z from "zod";

import { Navbar } from "#/components/layout/navbar";
import { getSearchedItemsQueryOptions } from "#/features/catalogue/components/search-box/api/get-searched-items";

const sharedParamsSchema = z.object({
  page: z.number().optional(),
  filter: z.string().optional(),
  sort: z.enum(["newest", "oldest", "highestRated", "lowestRated"]).optional(),
});

export const Route = createFileRoute("/_layout")({
  component: RouteComponent,
  validateSearch: sharedParamsSchema,
  loader: ({ context }) => {
    context.queryClient.ensureQueryData(getSearchedItemsQueryOptions(""));
  },
});

function RouteComponent() {
  return (
    <div className="">
      <Navbar />
      <div className="relative isolate flex min-h-svh flex-col">
        <div className="mx-auto max-w-7xl p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
