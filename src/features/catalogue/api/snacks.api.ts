import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance.ts";
import { getSnackBySlug } from "#/features/catalogue/server/services/get-snack-by-slug.service.ts";

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlugFn = createServerFn({ method: "GET" })
  .validator(snackSlugSchema)
  .handler(({ data }) => {
    return getSnackBySlug(data.slug, snacksRepository);
  });
