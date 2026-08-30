import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { SnacksListItem } from "#/features/catalogue/components/snacks-list-item";
import { listSnacksQueryOptions } from "#/features/catalogue/queries/list-snacks.query-options";

export function SnacksList() {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(listSnacksQueryOptions());

  const { ref } = useInView({
    rootMargin: "400px",
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

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
