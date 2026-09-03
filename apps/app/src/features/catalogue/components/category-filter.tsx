import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";

import { Badge } from "#/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#/components/ui/select";
import { Skeleton } from "#/components/ui/skeleton";
import { listTypesQueryOptions } from "#/features/catalogue/queries/list-types.query-options";
import { useIsMobile } from "#/hooks/use-mobile";

type Props = {
  activeSlug?: string | null;
};

export function CategoryFilter({ activeSlug }: Props) {
  const router = useRouter();
  const { data: types } = useSuspenseQuery(listTypesQueryOptions());
  const navigate = useNavigate({ from: "/" });
  const isMobile = useIsMobile();

  const allTypes = [{ name: "Wszystkie", slug: "" }, ...types];

  if (isMobile) {
    return (
      <Select
        value={activeSlug ?? ""}
        onChange={(key) => {
          const slug = String(key);
          if (!slug) {
            navigate({
              search: (prev) => {
                const next = { ...prev };
                delete next.category;
                return next;
              },
            });

            return;
          }

          navigate({ search: (prev) => ({ ...prev, category: slug }) });
        }}
      >
        <SelectTrigger className="w-auto min-w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {allTypes.map((type) => (
            <SelectItem
              key={type.slug}
              id={type.slug}
              onMouseEnter={() => {
                router.preloadRoute({
                  to: "/",
                  search: (prev) => {
                    if (!type.slug) {
                      const next = { ...prev };
                      delete next.category;
                      return next;
                    }

                    return { ...prev, category: type.slug };
                  },
                });
              }}
            >
              {type.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <div className="flex gap-2 overflow-x-auto py-1 scrollbar-thin">
      {allTypes.map((type) => (
        <Link
          key={type.slug}
          to="/"
          preload="intent"
          search={(prev) => {
            if (!type.slug) {
              const next = { ...prev };
              delete next.category;
              return next;
            }
            return { ...prev, category: type.slug };
          }}
          className="shrink-0 rounded-full"
        >
          <Badge
            variant={(activeSlug ?? "") === type.slug ? "default" : "secondary"}
            className="rounded-full px-4 py-3.5 text-sm"
          >
            {type.name}
          </Badge>
        </Link>
      ))}
    </div>
  );
}

export function CategoryFilterSkeleton() {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <Skeleton className="h-8 w-32 rounded-3xl" />;
  }

  return (
    <div className="flex gap-2 overflow-hidden p-1">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-7.5 w-22 shrink-0 rounded-full" />
      ))}
    </div>
  );
}
