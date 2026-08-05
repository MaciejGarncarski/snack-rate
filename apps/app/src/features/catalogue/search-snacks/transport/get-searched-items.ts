import { os } from "@orpc/server";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { searchSnacksUseCase } from "#/features/catalogue/server/use-cases/search-snacks.use-case";
import { searchSchema } from "#/schemas/search";

export const getSearchedItemsProcedure = os
  .input(searchSchema)
  .handler(({ input }) => searchSnacksUseCase(input.query, snacksRepository));
