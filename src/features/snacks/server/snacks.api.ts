import { os } from "@orpc/server";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { snackDTO } from "#/features/snacks/server/snack-item.mapper";
import { db } from "#/infrastructure/db/db";

export const listSnacks = os
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().optional(),
    }),
  )
  .handler(async ({ input }) => {
    const { limit, cursor } = input;

    const snacks = await db.query.snackItems.findMany({
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

    const hasNextPage = snacks.length > limit;
    const items = hasNextPage ? snacks.slice(0, limit) : snacks;
    const nextCursor = hasNextPage ? items.at(-1)?.id || null : null;

    const itemsWithImages = await snackDTO(items);

    return {
      items: itemsWithImages,
      nextCursor,
    };
  });

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlug = createServerFn()
  .inputValidator(snackSlugSchema)
  .handler(async ({ data }) => {
    const snack = await db.query.snackItems.findFirst({
      where: {
        slug: data.slug,
      },
    });

    return snack;
  });
