import type { SnacksRepository } from "../repositories/snacks.repository";

type ListSnacksInput = {
  limit: number;
  cursor: string | undefined;
};

export async function listSnacksFeed(
  { limit, cursor }: ListSnacksInput,
  repository: SnacksRepository,
) {
  const pageItems = await repository.list(limit + 1, cursor);
  const hasNextPage = pageItems.length > limit;
  const items = hasNextPage ? pageItems.slice(0, limit) : pageItems;

  const nextCursor = hasNextPage ? (items.at(-1)?.id ?? null) : null;

  return {
    items,
    nextCursor,
  };
}
