import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";

export function searchSnacksUseCase(query: string, repository: SnacksRepository) {
  const queryLowerCase = query.toLowerCase();
  return repository.search(queryLowerCase);
}
