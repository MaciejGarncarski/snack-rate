import { orpc } from "#/orpc/client";

export const getSearchedItemsQueryOptions = (query: string) => {
  return orpc.snacks.search.queryOptions({
    input: { query },
    staleTime: 5 * 60 * 1000,
  });
};
