import { createRatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { rateSnack } from "#/features/ratings/server/use-cases/rate-snack.use-case";
import type { Db } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Db;
let repository: ReturnType<typeof createRatingsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createRatingsRepository({ db });
});

describe("rate snack", () => {
  it("should rate a snack as guest", async () => {
    const snack = await createSnack();
    const guestId = "guest-1";

    const result = await rateSnack({ snackItemId: snack.id, rating: 4, guestId }, repository);

    expect(result.rating.value).toBe(4);
    expect(result.avgRating).toBe(4);
    expect(result.ratingCount).toBe(1);
    expect(result.distribution).toEqual({ "4.0": 1 });
  });

  it("should update an existing rating on re-rate", async () => {
    const snack = await createSnack();
    const guestId = "guest-2";

    await rateSnack({ snackItemId: snack.id, rating: 2, guestId }, repository);
    const result = await rateSnack({ snackItemId: snack.id, rating: 5, guestId }, repository);

    expect(result.rating.value).toBe(5);
    expect(result.avgRating).toBe(5);
    expect(result.ratingCount).toBe(1);
  });

  it("should compute average from multiple guest ratings", async () => {
    const snack = await createSnack();

    await rateSnack({ snackItemId: snack.id, rating: 1, guestId: "guest-a" }, repository);
    await rateSnack({ snackItemId: snack.id, rating: 2, guestId: "guest-b" }, repository);
    await rateSnack({ snackItemId: snack.id, rating: 3, guestId: "guest-c" }, repository);
    const result = await rateSnack(
      { snackItemId: snack.id, rating: 4, guestId: "guest-d" },
      repository,
    );

    expect(result.avgRating).toBe(2.5);
    expect(result.ratingCount).toBe(4);
    expect(result.distribution).toEqual({
      "1.0": 1,
      "2.0": 1,
      "3.0": 1,
      "4.0": 1,
    });
  });

  it("should update avgRating on snack_items table", async () => {
    const snack = await createSnack();

    await rateSnack({ snackItemId: snack.id, rating: 3, guestId: "guest-x" }, repository);

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
    });
    expect(Number(dbSnack?.avgRating)).toBe(3);
  });

  it("should throw if neither userId nor guestId provided", async () => {
    const snack = await createSnack();

    expect(() => rateSnack({ snackItemId: snack.id, rating: 4 }, repository)).toThrow(
      "Either userId or guestId must be provided",
    );
  });

  it("should handle half-star ratings", async () => {
    const snack = await createSnack();

    const result = await rateSnack(
      { snackItemId: snack.id, rating: 3.5, guestId: "guest-half" },
      repository,
    );

    expect(result.rating.value).toBe(3.5);
    expect(result.avgRating).toBe(3.5);
  });
});
