import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { CandyIcon } from "lucide-react";
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

export function SnacksList({ category }: { category?: string | null }) {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    listSnacksQueryOptions({ typeSlug: category ?? undefined }),
  );

  const { ref } = useInView({
    rootMargin: "400px",
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
      <div className="flex w-full items-center justify-center ">
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CandyIcon />
            </EmptyMedia>
            <EmptyTitle>Brak dostępnych przekąsek</EmptyTitle>
            <EmptyDescription>Brak przekąsek w tej kategorii.</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  return (
    <div>
      <ul className="mx-auto flex flex-col gap-14 md:grid md:grid-cols-2">
        {data.pages
          .flatMap((page) => page.items)
          .map((snack, idx) => (
            <SnacksListItem
              lazy={idx > 1}
              key={snack.slug}
              name={snack.name}
              description={snack.description}
              slug={snack.slug}
              rating={snack.avgRating}
              type={snack.type.name}
              images={snack.images}
            />
          ))}
      </ul>
      <div ref={ref} />
    </div>
  );
}
