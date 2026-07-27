import { PRODUCTS_PER_SCROLL } from "#/const/image-const";
import { orpc } from "#/orpc/client";

export const listSnacksQueryOptions = () => {
  return orpc.snacks.list.infiniteOptions({
    staleTime: 5 * 60 * 1000,
    input: (pageParam: string | null) => {
      return {
        limit: PRODUCTS_PER_SCROLL,
        cursor: pageParam ?? undefined,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
