import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { ProductListItem } from "#/features/products/components/product-list-item";
import { orpc } from "#/orpc/client";

const PRODUCTS_PER_PAGE = 12;

export function ProductsList() {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(
    orpc.listProducts.infiniteOptions({
      input: (pageParam: string | null) => ({
        limit: PRODUCTS_PER_PAGE,
        cursor: pageParam ?? undefined,
      }),
      initialPageParam: null,
      getNextPageParam: (lastPage) => {
        return lastPage.nextCursor;
      },
    }),
  );

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
      <h2 className="mb-4 text-2xl font-bold">Products</h2>
      <ul className="mx-auto grid max-w-[80rem] gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10">
        {data.pages
          .flatMap((page) => page.items)
          .map((product) => (
            <ProductListItem
              key={product.slug}
              name={product.name}
              description={product.description}
              slug={product.slug}
              rating={product.avgRating}
              images={product.images}
            />
          ))}
      </ul>
      <div ref={ref} />
    </div>
  );
}
