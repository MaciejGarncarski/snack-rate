import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { searchSnacksUseCase } from "#/features/catalogue/server/use-cases/search-snacks.use-case";
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

describe("search snacks", () => {
  it("should return snacks matching the query by name", async () => {
    const snack = await createSnack({ name: "Sour Cream Chips" });
    const results = await searchSnacksUseCase("sour cream", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should return snacks matching the query by description", async () => {
    const snack = await createSnack({ description: "Spicy jalapeño flavor" });
    const results = await searchSnacksUseCase("jalapeño", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should be case-insensitive", async () => {
    const snack = await createSnack({ name: "Chocolate Bar" });
    const results = await searchSnacksUseCase("CHOCOLATE", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should return an empty array when no snacks match", async () => {
    const results = await searchSnacksUseCase("xyznonexistent", repository);
    expect(results).toEqual([]);
  });

  it("should limit results to MAX_SEARCH_RESULTS", async () => {
    for (let i = 0; i < 10; i++) {
      await createSnack({ name: `Unique Snack ${i}` });
    }

    const results = await searchSnacksUseCase("Unique Snack", repository);
    expect(results).toHaveLength(8);
  });
});
