import {
  createSnacksRepository,
  type SnacksRepository,
} from "#/features/catalogue/server/repositories/snacks.repository";
import { createSnack } from "#/features/catalogue/server/services/create-snack.service";
import type { Db } from "#/infrastructure/db/db";
import { getDb } from "#/tests/setup";
import { noopGetFileUrl } from "#/tests/utils";

let db: Db;
let repository: SnacksRepository;

beforeAll(() => {
  db = getDb();
  repository = createSnacksRepository({
    db,
    getFileUrl: noopGetFileUrl,
  });
});

describe("create snack", () => {
  it("should create a snack with valid input", async () => {
    const input = {
      name: "Test Snack",
      description: "A delicious test snack",
      price: 2.99,
      images: [],
    };

    const snack = await createSnack(
      {
        images: input.images,
        name: input.name,
        description: input.description,
        price: input.price,
      },
      repository,
    );

    const dbSnack = await db.query.snackItems.findFirst({
      where: { id: snack.snackId },
      with: {
        images: true,
        type: true,
      },
    });

    expect(dbSnack).not.toBeNull();
    expect(dbSnack?.name).toBe(input.name);
    expect(dbSnack?.description).toBe(input.description);
    expect(dbSnack?.price).toBe(String(input.price));
    expect(dbSnack?.images).toEqual([]);
    expect(dbSnack?.typeId).toBeNull();
  });
});
