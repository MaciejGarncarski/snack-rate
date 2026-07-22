import type { SnacksRepository } from "@/features/catalogue/server/repositories/snacks.repository";

export function getSnackBySlug(slug: string, repository: SnacksRepository) {
  return repository.getBySlug(slug);
}
