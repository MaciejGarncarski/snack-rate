import * as z from "zod";

import { decodeCursor, slicePage } from "#/lib/cursor";
import { listSnacksSchema } from "#/schemas/catalogue";

import type { SnacksRepository } from "../repositories/snacks.repository";

export async function listSnacksUseCase(
  { limit, cursor, typeSlug }: z.infer<typeof listSnacksSchema>,
  repository: SnacksRepository,
) {
  const decodedCursor = cursor ? decodeCursor(cursor) : null;

  const pageItems = await repository.list(limit + 1, decodedCursor, typeSlug ?? null);

  return slicePage(pageItems, limit);
}
