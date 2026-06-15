import { snackMapper } from "#/features/snacks/server/snack-item.mapper";
import { snacksRepository } from "#/features/snacks/server/snacks.repository";

export const getSnackBySlugUseCase = async (slug: string) => {
  const snack = await snacksRepository.getBySlug(slug);

  if (snack) {
    return snackMapper.toDTO(snack);
  }

  return null;
};
