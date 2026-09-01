import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { CandyIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useInView } from "react-intersection-observer";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "#/components/ui/empty";
import { SnacksListItem } from "#/features/catalogue/components/snacks-list-item";
import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query-options";
import type { SortBy } from "#/schemas/catalogue";

export function SnacksList({
  category,
  sortBy,
}: {
  category?: string | null;
  sortBy?: SortBy | null;
}) {
  const { data, hasNextPage, fetchNextPage, isFetching } = useSuspenseInfiniteQuery(
    listSnacksQueryOptions({ typeSlug: category ?? undefined, sortBy: sortBy ?? undefined }),
  );

  const { ref } = useInView({
    rootMargin: "200px",
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  const isEmpty = data.pages[0].items.length === 0;

  if (isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex w-full items-center justify-center"
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CandyIcon />
            </EmptyMedia>
            <EmptyTitle>Brak dostępnych przekąsek</EmptyTitle>
            <EmptyDescription>Brak przekąsek w tej kategorii.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </motion.div>
    );
  }

  return (
    <div>
      <AnimatePresence mode="popLayout">
        <ul className="mx-auto flex flex-col gap-8 sm:gap-10 lg:gap-12 md:grid lg:grid-cols-2">
          {data.pages
            .flatMap((page) => page.items)
            .map((snack, idx) => (
              <SnacksListItem
                lazy={idx > 1}
                key={snack.slug}
                name={snack.name}
                description={snack.description}
                slug={snack.slug}
                rating={snack.rating.avg}
                ratingCount={snack.rating.count}
                type={snack.type.name}
                images={snack.images}
              />
            ))}
        </ul>
      </AnimatePresence>
      <div className="h-4 mt-40 w-full">
        {hasNextPage && !isFetching && <div ref={ref} className="h-4 w-full"></div>}
      </div>
    </div>
  );
}
