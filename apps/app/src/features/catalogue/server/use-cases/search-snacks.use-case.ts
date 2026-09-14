import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { addContext } from "#/observability/context";

export function searchSnacksUseCase(query: string, repository: SnacksRepository) {
  addContext({ span: { "search.query": query } });

  const normalized = query.trim().toLowerCase();

  return repository.search(normalized);
}
