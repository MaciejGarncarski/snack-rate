import { createServerFn } from "@tanstack/react-start";

import { snacksRepository } from "#/features/catalogue/server/repositories/snacks.repository.instance";
import { searchSnacksUseCase } from "#/features/catalogue/server/use-cases/search-snacks.use-case";
import { searchSchema } from "#/schemas/search";

export const getSearchedItems = createServerFn()
  .validator(searchSchema)
  .handler(({ data }) => searchSnacksUseCase(data.query, snacksRepository));
