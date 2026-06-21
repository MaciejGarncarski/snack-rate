import { createSnacksRepository } from "#/features/catalogue/server/repositories/snacks.repository";
import { searchSnacks } from "#/features/catalogue/server/services/search-snacks.service";
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

describe("search snacks", () => {
  it("should return snacks matching the query by name", async () => {
    const snack = await createSnack({ name: "Sour Cream Chips" });
    const results = await searchSnacks("sour cream", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should return snacks matching the query by description", async () => {
    const snack = await createSnack({ description: "Spicy jalapeño flavor" });
    const results = await searchSnacks("jalapeño", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should be case-insensitive", async () => {
    const snack = await createSnack({ name: "Chocolate Bar" });
    const results = await searchSnacks("CHOCOLATE", repository);

    expect(results.length).toBeGreaterThanOrEqual(1);
    expect(results.some((s) => s.id === snack.id)).toBe(true);
  });

  it("should return an empty array when no snacks match", async () => {
    const results = await searchSnacks("xyznonexistent", repository);
    expect(results).toEqual([]);
  });

  it("should limit results to 6", async () => {
    for (let i = 0; i < 8; i++) {
      await createSnack({ name: `Unique Snack ${i}` });
    }

    const results = await searchSnacks("Unique Snack", repository);
    expect(results).toHaveLength(6);
  });
});
