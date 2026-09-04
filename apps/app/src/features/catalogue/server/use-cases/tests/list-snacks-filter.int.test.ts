import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { listSnacksUseCase } from "#/features/catalogue/server/use-cases/list-snacks.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack, createSnackType } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";
import { noopGetFileUrl } from "#/tests/utils";

let db: Database;
let repository: ReturnType<typeof createSnacksRepository>;

beforeAll(() => {
  db = getDb();
  repository = createSnacksRepository({ db, getFileUrl: noopGetFileUrl });
});

describe("list snacks with category filter", () => {
  it("filters by typeSlug", async () => {
    const chips = await createSnackType({ name: "Chipsy", slug: "chipsy" });
    const choco = await createSnackType({ name: "Czekolada", slug: "czekolada" });
    await createSnack({ name: "Chips A", typeId: chips.id });
    await createSnack({ name: "Chips B", typeId: chips.id });
    await createSnack({ name: "Choco A", typeId: choco.id });

    const filtered = await listSnacksUseCase({ limit: 10, typeSlug: "chipsy" }, repository);
    expect(filtered.items).toHaveLength(2);
    expect(filtered.items.every((s) => s.type.slug === "chipsy")).toBe(true);

    const all = await listSnacksUseCase({ limit: 10 }, repository);
    expect(all.items).toHaveLength(3);
  });

  it("returns empty for unknown typeSlug", async () => {
    await createSnack({ name: "Snack X" });
    const result = await listSnacksUseCase({ limit: 10, typeSlug: "unknown" }, repository);
    expect(result.items).toHaveLength(0);
    expect(result.nextCursor).toBeNull();
  });

  it("paginates with filter", async () => {
    const type = await createSnackType({ name: "Napoje", slug: "napoje" });
    for (let i = 0; i < 3; i++) await createSnack({ name: `Napoje ${i}`, typeId: type.id });
    await createSnack({ name: "Other" });

    const page1 = await listSnacksUseCase({ limit: 2, typeSlug: "napoje" }, repository);
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    // assertion on nextCursor because its checked before
    const page2 = await listSnacksUseCase(
      { limit: 2, cursor: page1.nextCursor as string, typeSlug: "napoje" },
      repository,
    );
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].type.slug).toBe("napoje");
  });
});
