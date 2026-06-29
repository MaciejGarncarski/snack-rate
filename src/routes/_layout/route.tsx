import { createFileRoute, Outlet } from "@tanstack/react-router";
import * as z from "zod";

import { Navbar } from "#/components/layout/navbar";
import { AnchoredToastProvider, ToastProvider } from "#/components/ui/toast";
import { getSearchedItemsQueryOptions } from "#/features/catalogue/search-snacks/api/get-searched-items";

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
      <ToastProvider>
        <AnchoredToastProvider>
          <div className="relative isolate mx-auto flex min-h-svh max-w-5xl flex-col p-8">
            <Outlet />
          </div>
        </AnchoredToastProvider>
      </ToastProvider>
    </div>
  );
}
