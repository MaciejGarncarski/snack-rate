import { queryOptions } from "@tanstack/react-query";

import { client } from "#/orpc/client";

export const getSearchedItemsQueryOptions = (query: string) => {
  return queryOptions({
    queryKey: ["search", query],
    staleTime: 5 * 60 * 1000,
    enabled: query.length > 0,
    queryFn: () => {
      return client.snacks.search({ query });
    },
  });
};
