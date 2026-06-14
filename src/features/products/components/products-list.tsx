import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useInView } from "react-intersection-observer";

import { ProductListItem } from "#/features/products/components/product-list-item";
import { listProductsQueryOptions } from "#/features/products/services/list-products.query";

export function ProductsList() {
  const { data, hasNextPage, fetchNextPage } = useSuspenseInfiniteQuery(listProductsQueryOptions());

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
      <ul className="mx-auto grid max-w-4xl grid-cols-1 gap-4 lg:gap-14">
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
