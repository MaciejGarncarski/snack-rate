import { queryOptions } from "@tanstack/react-query";

import { getProductBySlug } from "#/features/products/server/products.api";

export const getProductBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => {
      return getProductBySlug({
        data: { slug },
      });
    },
  });
