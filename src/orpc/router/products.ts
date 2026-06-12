import { os } from "@orpc/server";
import * as z from "zod";

import { db } from "#/db/db.server";
import { getFileUrl } from "#/lib/s3";

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
      orderBy: (snackItems, { asc }) => [asc(snackItems.id)],
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

    const itemsWithImages = await Promise.all(
      items.map(async (item) => ({
        ...item,
        images: await Promise.all(
          item.images.map(async (img) => ({
            ...img,
            url: await getFileUrl(img.storageKey),
          })),
        ),
      })),
    );

    return {
      items: itemsWithImages,
      nextCursor,
    };
  });
