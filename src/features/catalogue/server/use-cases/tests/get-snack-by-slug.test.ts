import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { getSnackBySlug } from "#/features/catalogue/server/use-cases/get-snack-by-slug.use-case";
import type { Db } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup";
import { noopGetFileUrl } from "#/tests/utils";

let db: Db;
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
    const snack = await getSnackBySlug(createdSnack.slug, repository);

    expect(snack).not.toBeNull();
    expect(snack?.id).toBe(createdSnack.id);
    expect(snack?.name).toBe(createdSnack.name);
    expect(snack?.slug).toBe(createdSnack.slug);
  });

  it("should return null when snack does not exist", async () => {
    const snack = await getSnackBySlug("non-existent-slug", repository);
    expect(snack).toBeNull();
  });
});
