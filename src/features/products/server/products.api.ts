import { os } from "@orpc/server";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { productDTO } from "#/features/products/server/product-item.mapper";
import { db } from "#/infrastructure/db/db";

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

    const itemsWithImages = await productDTO(items);

    return {
      items: itemsWithImages,
      nextCursor,
    };
  });

const productSlugSchema = z.object({
  slug: z.string(),
});

export const getProductBySlug = createServerFn()
  .inputValidator(productSlugSchema)
  .handler(async ({ data }) => {
    const product = await db.query.snackItems.findFirst({
      where: {
        slug: data.slug,
      },
    });

    return product;
  });
