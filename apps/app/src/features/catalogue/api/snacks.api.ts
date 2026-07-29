import { createServerFn } from "@tanstack/react-start";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance.ts";
import { getSnackBySlug } from "#/features/catalogue/server/use-cases/get-snack-by-slug.use-case";
import { snackSlugSchema } from "#/schemas/catalogue";

export const getSnackBySlugFn = createServerFn({ method: "GET" })
  .validator(snackSlugSchema)
  .handler(({ data }) => {
    return getSnackBySlug(data.slug, snacksRepository);
  });
