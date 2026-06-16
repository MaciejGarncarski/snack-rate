import { createServerFn } from "@tanstack/react-start";
import * as z from "zod";

import { getSnackBySlugUseCase } from "#/features/snacks/server/use-cases/get-snack-by-slug.use-case";

const snackSlugSchema = z.object({
  slug: z.string(),
});

export const getSnackBySlug = createServerFn({ method: "GET" })
  .inputValidator(snackSlugSchema)
  .handler(({ data }) => {
    return getSnackBySlugUseCase(data.slug);
  });
