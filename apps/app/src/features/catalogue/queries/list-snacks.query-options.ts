import { PRODUCTS_PER_SCROLL } from "#/const/image-const";
import { orpc } from "#/orpc/client";

export const listSnacksQueryOptions = (opts?: { typeSlug?: string | null }) => {
  const typeSlug = opts?.typeSlug ?? undefined;
  return orpc.snacks.list.infiniteOptions({
    staleTime: 5 * 60 * 1000,
    input: (pageParam: string | null) => {
      return {
        limit: PRODUCTS_PER_SCROLL,
        cursor: pageParam ?? undefined,
        typeSlug,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
