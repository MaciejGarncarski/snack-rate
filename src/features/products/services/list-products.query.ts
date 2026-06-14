import { orpc } from "#/orpc/client";

const PRODUCTS_PER_PAGE = 12;

export const listProductsQueryOptions = () => {
  return orpc.listProducts.infiniteOptions({
    staleTime: 5 * 60 * 1000,
    input: (pageParam: string | null) => ({
      limit: PRODUCTS_PER_PAGE,
      cursor: pageParam ?? undefined,
    }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
