import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { searchSnacksUseCase } from "#/features/catalogue/server/use-cases/search-snacks.use-case";
import { searchSchema } from "#/schemas/search";

export const getSearchedItems = createServerFn()
  .validator(searchSchema)
  .handler(({ data }) => searchSnacksUseCase(data.query, snacksRepository));

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
