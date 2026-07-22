import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { searchSnacks } from "#/features/catalogue/server/use-cases/search-snacks.use-case";

const searchInputSchema = z.object({
  query: z.string().max(100),
});

export const getSearchedItems = createServerFn()
  .validator(searchInputSchema)
  .handler(({ data }) => searchSnacks(data.query, snacksRepository));

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
