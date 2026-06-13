import { queryOptions } from "@tanstack/react-query";
import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { db } from "#/server/db/db.server";

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

export const getProductBySlugQueryOptions = (slug: string) =>
  queryOptions({
    queryKey: ["product", slug],
    queryFn: () => {
      return getProductBySlug({
        data: { slug },
      });
    },
  });
