import { os } from "@orpc/server";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance.ts";
import { getSnackBySlugUseCase } from "#/features/catalogue/server/use-cases/get-snack-by-slug.use-case";
import { snackSlugSchema } from "#/schemas/catalogue";

export const getSnackBySlugProcedure = os.input(snackSlugSchema).handler(({ input }) => {
  return getSnackBySlugUseCase(input.slug, snacksRepository);
});
