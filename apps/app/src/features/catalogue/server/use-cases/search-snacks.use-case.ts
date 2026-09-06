import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { addContext } from "#/observability/context";

export function searchSnacksUseCase(query: string, repository: SnacksRepository) {
  addContext({ span: { "search.query": query } });
  const queryLowerCase = query.toLowerCase();
  return repository.search(queryLowerCase);
}
