import { SnackMapper } from "#/features/snacks/server/snack-item.mapper";
import { snacksRepository } from "#/features/snacks/server/snacks.repository";

export async function searchSnacksUseCase(query: string) {
  const queryLowerCase = query.toLowerCase();
  const searched = await snacksRepository.search(queryLowerCase);
  const snacks = await SnackMapper.toDomain(searched);

  return snacks.map((snack) => SnackMapper.toDTO(snack));
}
