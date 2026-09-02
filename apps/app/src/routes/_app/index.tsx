import type { QueryClient } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import * as z from "zod";

import {
  CategoryFilter,
  CategoryFilterSkeleton,
} from "#/features/catalogue/components/category-filter";
import { SnacksList } from "#/features/catalogue/components/snacks-list";
import { SnacksListSkeleton } from "#/features/catalogue/components/snacks-list-skeleton";
import { SortFilter, SortFilterSkeleton } from "#/features/catalogue/components/sort-filter";
import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query-options";
import { listTypesQueryOptions } from "#/features/catalogue/queries/list-types.query-options";
import { sortByEnum } from "#/schemas/catalogue";

const searchSchema = z.looseObject({
  category: z.string().optional(),
  sortBy: sortByEnum.optional(),
});

export const Route = createFileRoute("/_app/")({
  component: RouteComponent,
  validateSearch: searchSchema,
  loaderDeps: ({ search: { category, sortBy } }) => ({ category, sortBy }),
  loader: ({
    context,
    deps,
  }: {
    context: { queryClient: QueryClient };
    deps: {
      category?: string;
      sortBy?: "newest" | "oldest" | "most_reviewed" | "most_liked" | "most_disliked";
    };
  }) => {
    void context.queryClient.query({
      ...listTypesQueryOptions(),
      staleTime: "static",
    });
    void context.queryClient.infiniteQuery({
      ...listSnacksQueryOptions({ typeSlug: deps.category, sortBy: deps.sortBy }),
      staleTime: "static",
    });
  },
  pendingComponent: () => (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <CategoryFilterSkeleton />
        <SortFilterSkeleton />
      </div>
      <SnacksListSkeleton />
    </div>
  ),
});

function RouteComponent() {
  const { category, sortBy } = Route.useSearch();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <ClientOnly fallback={<CategoryFilterSkeleton />}>
          <CategoryFilter activeSlug={category ?? null} />
        </ClientOnly>
        <SortFilter activeSortBy={sortBy ?? null} />
      </div>
      <SnacksList category={category ?? null} sortBy={sortBy ?? null} />
    </div>
  );
}
