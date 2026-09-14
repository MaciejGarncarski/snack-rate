import ms from "ms";

import { orpc } from "#/orpc/client";

export const INITIAL_SEARCH_ITEMS_LIMIT = 8;

export const getInitialSearchItemsQueryOptions = (enabled: boolean) => {
  return orpc.snacks.list.queryOptions({
    input: { limit: INITIAL_SEARCH_ITEMS_LIMIT, sortBy: "newest" },
    staleTime: ms("5m"),
    enabled,
  });
};
