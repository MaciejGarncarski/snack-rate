import { useSuspenseQuery } from "@tanstack/react-query";
import { Link, useNavigate, useRouter } from "@tanstack/react-router";
import {
  Candy,
  CupSoda,
  Dessert,
  LayoutGrid,
  Popcorn,
  Shapes,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { motion } from "motion/react";

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
import { cn } from "#/lib/utils.ts";

const typeIcons: Record<string, LucideIcon> = {
  "": LayoutGrid,
  chipsy: Popcorn,
  czekolada: Dessert,
  energetyk: Zap,
  napoj: CupSoda,
  slodycze: Candy,
};

function getTypeIcon(slug: string): LucideIcon {
  return typeIcons[slug] ?? Shapes;
}

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
        aria-label="Filtr kategorii"
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
    <div className="no-scrollbar -mx-1 flex gap-2.5 overflow-x-auto px-1 py-1">
      {allTypes.map((type) => {
        const isActive = (activeSlug ?? "") === type.slug;
        const Icon = getTypeIcon(type.slug);
        return (
          <motion.span key={type.slug} whileTap={{ scale: 0.95 }} className="shrink-0">
            <Link
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
              aria-current={isActive ? "true" : undefined}
              className={cn(
                "flex h-8 items-center justify-center gap-2 rounded-full border px-3.5 text-sm whitespace-nowrap transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
                isActive
                  ? "border-transparent bg-primary font-semibold text-primary-foreground hover:bg-primary/90"
                  : "border-transparent bg-muted font-medium text-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <Icon aria-hidden className="size-4" />
              {type.name}
            </Link>
          </motion.span>
        );
      })}
    </div>
  );
}

export function CategoryFilterSkeleton() {
  return (
    <>
      <div className="hidden md:flex gap-2.5 overflow-hidden px-1 py-1">
        {["w-28", "w-24", "w-30", "w-26", "w-22", "w-24"].map((width, i) => (
          <Skeleton key={i} className={cn("h-8 shrink-0 rounded-full", width)} />
        ))}
      </div>
      <Skeleton className="h-8 w-32 rounded-3xl block md:hidden" />
    </>
  );
}
