import type { QueryClient } from "@tanstack/react-query";
import { ClientOnly, createFileRoute } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { LayoutGrid, LayoutList } from "lucide-react";
import * as z from "zod";

import { ToggleGroup, ToggleGroupItem } from "#/components/ui/toggle-group";
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";
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
import { layoutStore, setLayout, useSyncLayout } from "#/stores/layout-store";

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
  useSyncLayout();
  const layout = useSelector(layoutStore, (s) => s);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <ClientOnly fallback={<CategoryFilterSkeleton />}>
          <CategoryFilter activeSlug={category ?? null} />
        </ClientOnly>
        <div className="flex items-center gap-2">
          <ToggleGroup
            selectionMode="single"
            selectedKeys={new Set([layout])}
            onSelectionChange={(keys) => {
              const value = [...keys][0];

              if (value === "1col" || value === "2col") {
                setLayout(value);
              }
            }}
            variant="outline"
            size="sm"
            className="hidden md:inline-flex"
          >
            <TooltipTrigger>
              <ToggleGroupItem id="1col" aria-label="List view">
                <LayoutList />
              </ToggleGroupItem>
              <Tooltip>Widok listy</Tooltip>
            </TooltipTrigger>

            <TooltipTrigger>
              <ToggleGroupItem id="2col" aria-label="Grid view">
                <LayoutGrid />
              </ToggleGroupItem>
              <Tooltip>Widok siatki</Tooltip>
            </TooltipTrigger>
          </ToggleGroup>
          <SortFilter activeSortBy={sortBy ?? null} />
        </div>
      </div>
      <SnacksList category={category ?? null} sortBy={sortBy ?? null} layout={layout} />
    </div>
  );
}
