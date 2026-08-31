import { useSuspenseQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import { Skeleton } from "#/components/ui/skeleton";
import { listTypesQueryOptions } from "#/features/catalogue/queries/list-types.query-options";

type Props = {
  activeSlug?: string | null;
};

export function CategoryFilter({ activeSlug }: Props) {
  const { data: types } = useSuspenseQuery(listTypesQueryOptions());

  return (
    <div className="flex w-full gap-2 overflow-x-auto pb-2 scrollbar-thin">
      <Link
        to="/"
        search={(prev: Record<string, unknown>) => {
          const next = { ...prev };
          delete next.category;
          return next;
        }}
        className="shrink-0"
      >
        <Badge
          variant={!activeSlug ? "default" : "secondary"}
          className="rounded-full px-4 py-4 text-sm font-medium"
        >
          Wszystkie
        </Badge>
      </Link>
      {types.map((type) => (
        <Link
          key={type.slug}
          to="/"
          search={(prev: Record<string, unknown>) => ({ ...prev, category: type.slug })}
          className="shrink-0"
        >
          <Badge
            variant={activeSlug === type.slug ? "default" : "secondary"}
            className="rounded-full px-4 py-4 text-sm font-medium"
          >
            {type.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <div className="flex w-full gap-2 overflow-hidden pb-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 shrink-0 rounded-full" />
      ))}
    </div>
  );
}
