import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { snacksRepository } from "../server/repositories/snacks.repository.instance";
import { getSnackBySlug } from "../server/services/get-snack-by-slug.service";

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlugFn = createServerFn({ method: "GET" })
  .inputValidator(snackSlugSchema)
  .handler(({ data }) => {
    return getSnackBySlug(data.slug, snacksRepository);
  });
