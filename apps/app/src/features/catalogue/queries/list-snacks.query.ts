import { orpc } from "#/orpc/client";

const SNACKS_PER_PAGE = 3;

export const listSnacksQueryOptions = () => {
  return orpc.snacks.list.infiniteOptions({
    staleTime: 5 * 60 * 1000,
    input: (pageParam: string | null) => {
      return {
        limit: SNACKS_PER_PAGE,
        cursor: pageParam ?? undefined,
      };
    },
    initialPageParam: null,
    getNextPageParam: (lastPage) => {
      return lastPage.nextCursor;
    },
  });
};
