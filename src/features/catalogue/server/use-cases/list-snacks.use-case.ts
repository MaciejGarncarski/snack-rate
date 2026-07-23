import { decodeCursor, encodeCursor } from "#/features/catalogue/server/use-cases/helpers";

import type { SnacksRepository } from "../repositories/snacks.repository";

type ListSnacksInput = {
  limit: number;
  cursor: string | undefined;
};

export async function listSnacksFeed(
  { limit, cursor }: ListSnacksInput,
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
