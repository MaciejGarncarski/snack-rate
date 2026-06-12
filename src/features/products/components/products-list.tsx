import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useInView } from "react-intersection-observer";

import { Card } from "#/components/ui/card";
import { ProductListItemImage } from "#/features/products/components/product-image";
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
            <li key={product.id}>
              <Link to="/product/$slug" params={{ slug: product.slug }}>
                <Card key={product.id} className="p-4">
                  <h3 className="text-lg font-semibold">{product.name}</h3>
                  <div className="mx-auto max-h-48 w-72 overflow-hidden rounded-md">
                    <ProductListItemImage src={product.images[0].url} alt={product.name} />
                  </div>
                  <p className="text-sm text-muted-foreground">{product.description}</p>
                </Card>
              </Link>
            </li>
          ))}
      </ul>
      <div ref={ref} />
    </div>
  );
}
