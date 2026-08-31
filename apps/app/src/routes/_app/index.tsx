import type { QueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import {
  CategoryFilter,
  CategoryFilterSkeleton,
} from "#/features/catalogue/components/category-filter";
import { SnacksList } from "#/features/catalogue/components/snacks-list";
import { SnacksListSkeleton } from "#/features/catalogue/components/snacks-list-skeleton";
import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query-options";
import { listTypesQueryOptions } from "#/features/catalogue/queries/list-types.query-options";

const searchSchema = z.looseObject({
  category: z.string().optional(),
});

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { category } }) => ({ category }),
  loader: ({
    context,
    deps,
  }: {
    context: { queryClient: QueryClient };
    deps: { category?: string };
  }) => {
    void context.queryClient.query({
      ...listTypesQueryOptions(),
      staleTime: "static",
    });
    void context.queryClient.infiniteQuery({
      ...listSnacksQueryOptions({ typeSlug: deps.category }),
      staleTime: "static",
    });
  },
  pendingComponent: () => (
    <div className="flex flex-col gap-6">
      <CategoryFilterSkeleton />
      <SnacksListSkeleton />
    </div>
  ),
});

function RouteComponent() {
  const { category } = Route.useSearch();

  return (
    <div className="flex flex-col gap-6">
      <CategoryFilter activeSlug={category ?? null} />
      <SnacksList category={category ?? null} />
    </div>
  );
}
