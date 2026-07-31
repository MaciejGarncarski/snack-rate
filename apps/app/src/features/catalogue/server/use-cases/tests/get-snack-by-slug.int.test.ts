import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { getSnackBySlugUseCase } from "#/features/catalogue/server/use-cases/get-snack-by-slug.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
let repository: ReturnType<typeof createSnacksRepository>;

beforeAll(() => {
  db = getDb();
  repository = createSnacksRepository({
    db,
    getFileUrl: noopGetFileUrl,
  });
});

describe("get snack by slug", () => {
  it("should return a snack when given a valid slug", async () => {
    const createdSnack = await createSnack();
    const snack = await getSnackBySlugUseCase(createdSnack.slug, repository);

    expect(snack).not.toBeNull();
    expect(snack?.id).toBe(createdSnack.id);
    expect(snack?.name).toBe(createdSnack.name);
    expect(snack?.slug).toBe(createdSnack.slug);
  });

  it("should return null when snack does not exist", async () => {
    const snack = await getSnackBySlugUseCase("non-existent-slug", repository);
    expect(snack).toBeNull();
  });
});
