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

describe("list snacks with sortBy", () => {
  it("sorts by oldest", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    const a = await createSnack({ name: "First", typeId: type.id });
    const b = await createSnack({ name: "Second", typeId: type.id });
    const c = await createSnack({ name: "Third", typeId: type.id });

    const result = await listSnacksUseCase({ limit: 10, sortBy: "oldest" }, repository);
    expect(result.items.map((s) => s.id)).toEqual([a.id, b.id, c.id]);
  });

  it("sorts by most_reviewed", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    await createSnack({ name: "Low", typeId: type.id, ratingCount: 1, avgRating: "5.00" });
    await createSnack({ name: "High", typeId: type.id, ratingCount: 10, avgRating: "8.00" });
    await createSnack({ name: "Mid", typeId: type.id, ratingCount: 5, avgRating: "7.00" });

    const result = await listSnacksUseCase({ limit: 10, sortBy: "most_reviewed" }, repository);
    expect(result.items.map((s) => s.rating.count)).toEqual([10, 5, 1]);
  });

  it("sorts by most_liked", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    await createSnack({ name: "Bad", typeId: type.id, avgRating: "3.00" });
    await createSnack({ name: "Great", typeId: type.id, avgRating: "9.50" });
    await createSnack({ name: "Ok", typeId: type.id, avgRating: "6.00" });

    const result = await listSnacksUseCase({ limit: 10, sortBy: "most_liked" }, repository);
    expect(result.items.map((s) => s.rating.avg)).toEqual([9.5, 6, 3]);
  });

  it("sorts by most_disliked", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    await createSnack({ name: "Great", typeId: type.id, avgRating: "9.00" });
    await createSnack({ name: "Bad", typeId: type.id, avgRating: "2.00" });
    await createSnack({ name: "Ok", typeId: type.id, avgRating: "6.00" });

    const result = await listSnacksUseCase({ limit: 10, sortBy: "most_disliked" }, repository);
    expect(result.items.map((s) => s.rating.avg)).toEqual([2, 6, 9]);
  });

  it("paginates with aggregate sort", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    await createSnack({ name: "A", typeId: type.id, ratingCount: 1 });
    await createSnack({ name: "B", typeId: type.id, ratingCount: 3 });
    await createSnack({ name: "C", typeId: type.id, ratingCount: 5 });

    const page1 = await listSnacksUseCase({ limit: 2, sortBy: "most_reviewed" }, repository);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0].rating.count).toBe(5);
    expect(page1.items[1].rating.count).toBe(3);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await listSnacksUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { limit: 2, sortBy: "most_reviewed", cursor: page1.nextCursor ?? undefined },
      repository,
    );
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].rating.count).toBe(1);
    expect(page2.nextCursor).toBeNull();
  });

  it("paginates with most_disliked sort", async () => {
    const type = await createSnackType({ name: "T", slug: "t" });
    await createSnack({ name: "Great", typeId: type.id, avgRating: "9.00" });
    await createSnack({ name: "Ok", typeId: type.id, avgRating: "6.00" });
    await createSnack({ name: "Bad", typeId: type.id, avgRating: "3.00" });

    const page1 = await listSnacksUseCase({ limit: 2, sortBy: "most_disliked" }, repository);
    expect(page1.items).toHaveLength(2);
    expect(page1.items[0].rating.avg).toBe(3);
    expect(page1.items[1].rating.avg).toBe(6);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await listSnacksUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { limit: 2, sortBy: "most_disliked", cursor: page1.nextCursor ?? undefined },
      repository,
    );
    expect(page2.items).toHaveLength(1);
    expect(page2.items[0].rating.avg).toBe(9);
    expect(page2.nextCursor).toBeNull();
  });
});
