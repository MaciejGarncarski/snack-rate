import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { db } from "#/db/db.server";
import { getFileUrl } from "#/lib/s3";

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

    const itemsWithImages = await Promise.all(
      searched.map(async (item) => ({
        ...item,
        images: await Promise.all(
          item.images.map(async (img) => ({
            ...img,
            url: await getFileUrl(img.storageKey),
          })),
        ),
      })),
    );

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
