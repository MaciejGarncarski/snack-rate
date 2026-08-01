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

  it("should save optional review body with the rating", async () => {
    const snack = await createSnack();
    const guestId = "guest-body";

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, body: "  Super chrupki  ", guestId },
      repository,
      db,
    );

    expect(result.rating.value).toBe(5);
    expect(result.rating.body).toBe("Super chrupki");

    const ratings = await repository.getRatingsForSnack({
      snackItemId: snack.id,
      userId: null,
      guestId,
    });

    expect(ratings.userRating).toBe(5);
    expect(ratings.userBody).toBe("Super chrupki");
  });

  it("should store null body when review text is empty", async () => {
    const snack = await createSnack();
    const guestId = "guest-empty-body";

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 3, body: "   ", guestId },
      repository,
      db,
    );

    expect(result.rating.body).toBeNull();
  });

  it("should accept the minimum rating of 1", async () => {
    const snack = await createSnack();
    const guestId = "guest-min";

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 1, guestId },
      repository,
      db,
    );

    expect(result.rating.value).toBe(1);
    expect(result.avgRating).toBe(1);
    expect(result.ratingCount).toBe(1);
    expect(result.distribution).toEqual({ "1": 1 });
  });

  it("should accept the maximum rating of 5", async () => {
    const snack = await createSnack();
    const guestId = "guest-max";

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, guestId },
      repository,
      db,
    );

    expect(result.rating.value).toBe(5);
    expect(result.avgRating).toBe(5);
    expect(result.ratingCount).toBe(1);
    expect(result.distribution).toEqual({ "5": 1 });
  });

  it("should round the average rating to two decimals", async () => {
    const snack = await createSnack();

    await rateSnackUseCase({ snackItemId: snack.id, rating: 1, guestId: "r1" }, repository, db);
    await rateSnackUseCase({ snackItemId: snack.id, rating: 2, guestId: "r2" }, repository, db);
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, guestId: "r3" },
      repository,
      db,
    );

    expect(result.avgRating).toBe(2.33);
  });

  it("should soft-delete the previous rating when the same guest re-rates", async () => {
    const snack = await createSnack();
    const guestId = "guest-soft-delete";

    await rateSnackUseCase({ snackItemId: snack.id, rating: 2, guestId }, repository, db);
    await rateSnackUseCase({ snackItemId: snack.id, rating: 5, guestId }, repository, db);

    const rows = await db.query.snackComments.findMany({
      where: { snackItemId: snack.id, guestId, rating: { isNotNull: true } },
    });

    const active = rows.filter((row) => row.deletedAt === null);
    const deleted = rows.filter((row) => row.deletedAt !== null);

    expect(active).toHaveLength(1);
    expect(active[0].rating).toBe(5);
    expect(deleted).toHaveLength(1);
    expect(deleted[0].rating).toBe(2);
  });

  it("should throw for a rating below the minimum", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase({ snackItemId: snack.id, rating: 0, guestId: "guest-low" }, repository, db),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw for a rating above the maximum", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase({ snackItemId: snack.id, rating: 6, guestId: "guest-high" }, repository, db),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw for a non-integer rating", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase(
        { snackItemId: snack.id, rating: 2.5, guestId: "guest-fraction" },
        repository,
        db,
      ),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw when guestId is an empty string", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase({ snackItemId: snack.id, rating: 4, guestId: "" }, repository, db),
    ).toThrow("Either userId or guestId must be provided");
  });

  it("should reject when the snack does not exist", async () => {
    const missingSnackId = "00000000-0000-0000-0000-000000000000";

    await expect(
      rateSnackUseCase(
        { snackItemId: missingSnackId, rating: 4, guestId: "guest-missing" },
        repository,
        db,
      ),
    ).rejects.toThrow("Failed query");
  });
});
