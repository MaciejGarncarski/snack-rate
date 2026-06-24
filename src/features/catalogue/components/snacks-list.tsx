import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { listSnacksQueryOptions } from "../queries/list-snacks.query";
import { SnacksListItem } from "./snacks-list-item";

export function SnacksList() {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(listSnacksQueryOptions());

  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView && hasNextPage) {
        fetchNextPage();
      }
    },
  });

  return (
    <div>
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-4 lg:gap-14">
        {data.pages
          .flatMap((page) => page.items)
          .map((snack) => (
            <SnacksListItem
              key={snack.slug}
              name={snack.name}
              description={snack.description}
              slug={snack.slug}
              rating={snack.avgRating}
              images={snack.images}
            />
          ))}
      </ul>
      <div ref={ref} />
    </div>
  );
}
