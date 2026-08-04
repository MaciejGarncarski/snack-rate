import { queryOptions } from "@tanstack/react-query";

import { getSearchedItems } from "#/features/catalogue/search-snacks/transport/get-searched-items";

export const getSearchedItemsQueryOptions = (query: string) => {
  return queryOptions({
    queryKey: ["search", query],
    staleTime: 5 * 60 * 1000,
    enabled: query.length > 0,
    queryFn: () => {
      return getSearchedItems({
        data: { query },
      });
    },
  });
};
