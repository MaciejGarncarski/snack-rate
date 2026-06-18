import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { listSnacksFeed } from "#/features/catalogue/server/services/list-snacks.service";
import type { Db } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup";

const noopGetFileUrl = (key: string) => Promise.resolve(`https://test.com/${key}`);

let db: Db;
let repository: ReturnType<typeof createSnacksRepository>;

beforeAll(() => {
  db = getDb();
  repository = createSnacksRepository({
    db,
    getFileUrl: noopGetFileUrl,
  });
});

describe("list snacks feed", () => {
  it("should return a page of snacks with no cursor", async () => {
    const snack1 = await createSnack({ name: "Snack A" });
    const snack2 = await createSnack({ name: "Snack B" });

    const result = await listSnacksFeed({ limit: 10, cursor: undefined }, repository);

    expect(result.items.length).toBeGreaterThanOrEqual(2);
    expect(result.items.some((s) => s.id === snack1.id)).toBe(true);
    expect(result.items.some((s) => s.id === snack2.id)).toBe(true);
  });

  it("should return nextCursor when there are more items", async () => {
    for (let i = 0; i < 5; i++) {
      await createSnack({ name: `Page Snack ${i}` });
    }

    const result = await listSnacksFeed({ limit: 2, cursor: undefined }, repository);

    expect(result.items).toHaveLength(2);
    expect(result.nextCursor).not.toBeNull();
  });

  it("should return null nextCursor when all items fit in the page", async () => {
    await createSnack({ name: "Only One" });

    const result = await listSnacksFeed({ limit: 100, cursor: undefined }, repository);

    expect(result.nextCursor).toBeNull();
  });

  it("should paginate using cursor", async () => {
    const snacks = [];
    for (let i = 0; i < 5; i++) {
      snacks.push(await createSnack({ name: `Cursor Snack ${i}` }));
    }

    const firstPage = await listSnacksFeed({ limit: 2, cursor: undefined }, repository);
    expect(firstPage.items).toHaveLength(2);
    expect(firstPage.nextCursor).not.toBeNull();

    const secondPage = await listSnacksFeed(
      { limit: 2, cursor: firstPage.nextCursor! },
      repository,
    );
    expect(secondPage.items).toHaveLength(2);

    const firstIds = firstPage.items.map((s) => s.id);
    const secondIds = secondPage.items.map((s) => s.id);
    expect(firstIds).not.toEqual(expect.arrayContaining(secondIds));
  });

  it("should return empty items when no snacks exist", async () => {
    const result = await listSnacksFeed({ limit: 10, cursor: undefined }, repository);
    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });
});
