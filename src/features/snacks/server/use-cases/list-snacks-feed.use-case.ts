import { snackMapper } from "#/features/snacks/server/snack-item.mapper";
import { snacksRepository } from "#/features/snacks/server/snacks.repository";

type ListSnacksFeedInput = {
  limit: number;
  cursor: string | undefined;
};

export async function listSnacksFeedUseCase({ limit, cursor }: ListSnacksFeedInput) {
  const pageItems = await snacksRepository.list(limit + 1, cursor);
  const hasNextPage = pageItems.length > limit;
  const items = hasNextPage ? pageItems.slice(0, limit) : pageItems;

  const nextCursor = hasNextPage ? (items.at(-1)?.getId() ?? null) : null;

  const snacks = items.map((snack) => snackMapper.toDTO(snack));

  return {
    items: snacks,
    nextCursor,
  };
}
