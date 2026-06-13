import { os } from "@orpc/server";
import * as z from "zod";

import { getFileUrl } from "#/lib/s3.server";
import { db } from "#/server/db/db.server";
import { hydrateSnackItemImages } from "#/server/modules/products/product-item.mapper";

export const listProducts = os
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { limit, cursor } = input;

    const products = await db.query.snackItems.findMany({
      orderBy: (snackItems, { asc }) => [asc(snackItems.createdAt)],
      limit: limit + 1,
      where: {
        id: { gt: cursor },
      },
      with: {
        brand: true,
        images: true,
        tags: true,
      },
    });

    const hasNextPage = products.length > limit;
    const items = hasNextPage ? products.slice(0, limit) : products;
    const nextCursor = hasNextPage ? items.at(-1)?.id || null : null;

    const itemsWithImages = await hydrateSnackItemImages(items);

    return {
      items: itemsWithImages,
      nextCursor,
    };
  });
