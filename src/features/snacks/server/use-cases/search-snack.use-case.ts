import { snackMapper } from "#/features/snacks/server/snack-item.mapper";
import { snacksRepository } from "#/features/snacks/server/snacks.repository";

export async function searchSnacksUseCase(query: string) {
  const queryLowerCase = query.toLowerCase();
  const searched = await snacksRepository.search(queryLowerCase);

  const snacks = searched.map((snack) => {
    return snackMapper.toDTO(snack);
  });

  return snacks;
}
