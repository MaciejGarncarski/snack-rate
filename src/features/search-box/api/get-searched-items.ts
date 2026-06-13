import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { db } from "#/server/db/db.server";
import { hydrateSnackItemImages } from "#/server/modules/products/product-item.mapper";

const searchInputSchema = z.object({
  query: z.string().max(100),
});

const MAX_SEARCH_RESULTS = 6;

export const getSearchedItems = createServerFn()
  .inputValidator(searchInputSchema)
  .handler(async ({ data }) => {
    const queryLowerCase = data.query.toLowerCase();

    const searched = await db.query.snackItems.findMany({
      with: {
        images: true,
      },
      limit: MAX_SEARCH_RESULTS,
      where: {
        OR: [
          {
            name: {
              ilike: `%${queryLowerCase}%`,
            },
          },
          {
            description: {
              ilike: `%${queryLowerCase}%`,
            },
          },
        ],
      },
    });

    const itemsWithImages = await hydrateSnackItemImages(searched);

    return itemsWithImages;
  });

export const getSearchedItemsQueryOptions = (query: string) => {
  return queryOptions({
    queryKey: ["search", query],
    queryFn: () => {
      return getSearchedItems({
        data: { query },
      });
    },
  });
};
