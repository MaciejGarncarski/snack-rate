import ms from "ms";

import { orpc } from "#/orpc/client";

export const getSearchedItemsQueryOptions = (query: string) => {
  return orpc.snacks.search.queryOptions({
    input: { query },
    staleTime: ms("5m"),
  });
};
