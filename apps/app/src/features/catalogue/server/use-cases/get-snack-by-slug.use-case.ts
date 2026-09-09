import type { SnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { getActiveSpan, startActiveSpan } from "#/observability/tracing";

export function getSnackBySlugUseCase(slug: string, repository: SnacksRepository) {
  getActiveSpan()?.setAttribute("snack.slug", slug);

  return startActiveSpan(
    "snacks.getBySlug",
    (span) => {
      span.setAttribute("snack.slug", slug);
      return repository.getBySlug(slug);
    },
    { attributes: { "snack.slug": slug } },
  );
}
