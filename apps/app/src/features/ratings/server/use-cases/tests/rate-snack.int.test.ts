import { createRatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { rateSnackUseCase } from "#/features/ratings/server/use-cases/rate-snack.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createRatingsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createRatingsRepository({ db });
});

describe("rate snack", () => {
  it("should rate a snack as guest", async () => {
    const snack = await createSnack();
    const guestId = "guest-1";

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, guestId },
      repository,
      db,
    );

    expect(result.rating.value).toBe(4);
    expect(result.avgRating).toBe(4);
    expect(result.ratingCount).toBe(1);
    expect(result.distribution).toEqual({ "4": 1 });
  });

  it("should update an existing rating on re-rate", async () => {
    const snack = await createSnack();
    const guestId = "guest-2";

    await rateSnackUseCase({ snackItemId: snack.id, rating: 2, guestId }, repository, db);
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, guestId },
      repository,
      db,
    );

    expect(result.rating.value).toBe(5);
    expect(result.avgRating).toBe(5);
    expect(result.ratingCount).toBe(1);
  });

  it("should compute average from multiple guest ratings", async () => {
    const snack = await createSnack();

    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 1, guestId: "guest-a" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 2, guestId: "guest-b" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 3, guestId: "guest-c" },
      repository,
      db,
    );
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, guestId: "guest-d" },
      repository,
      db,
    );

    expect(result.avgRating).toBe(2.5);
    expect(result.ratingCount).toBe(4);
    expect(result.distribution).toEqual({
      "1": 1,
      "2": 1,
      "3": 1,
      "4": 1,
    });
  });

  it("should update avgRating on snack_items table", async () => {
    const snack = await createSnack();

    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 3, guestId: "guest-x" },
      repository,
      db,
    );

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
    });
    expect(Number(dbSnack?.avgRating)).toBe(3);
  });

  it("should throw if neither userId nor guestId provided", async () => {
    const snack = await createSnack();

    expect(() => rateSnackUseCase({ snackItemId: snack.id, rating: 4 }, repository, db)).toThrow(
      "Either userId or guestId must be provided",
    );
  });
});
