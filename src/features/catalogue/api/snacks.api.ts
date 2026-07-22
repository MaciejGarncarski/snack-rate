import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { snacksRepository } from "@/features/catalogue/server/repositories/snacks.repository.instance.ts";
import { getSnackBySlug } from "@/features/catalogue/server/use-cases/get-snack-by-slug.use-case";

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlugFn = createServerFn({ method: "GET" })
  .validator(snackSlugSchema)
  .handler(({ data }) => {
    return getSnackBySlug(data.slug, snacksRepository);
  });
