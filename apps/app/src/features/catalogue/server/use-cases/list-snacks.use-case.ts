import * as z from "zod";

import { decodeCursor, encodeCursor } from "#/features/catalogue/server/use-cases/helpers";
import { listSnacksSchema } from "#/schemas/catalogue";

import type { SnacksRepository } from "../repositories/snacks.repository";

export async function listSnacksFeed(
  { limit, cursor }: z.infer<typeof listSnacksSchema>,
  repository: SnacksRepository,
) {
  const decodedCursor = cursor ? decodeCursor(cursor) : null;

  const pageItems = await repository.list(limit + 1, decodedCursor);
  const hasNextPage = pageItems.length > limit;

  const items = hasNextPage ? pageItems.slice(0, limit) : pageItems;

  const lastItem = items.at(-1);
  const nextCursor = hasNextPage && lastItem ? encodeCursor(lastItem.createdAt, lastItem.id) : null;

  return {
    items,
    nextCursor,
  };
}
