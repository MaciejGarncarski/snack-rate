import { uuidv7 } from "uuidv7";

import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { rateSnackUseCase } from "#/features/comments/server/use-cases/comment-snack.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createCommentsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createCommentsRepository({ db });
});

describe("rate snack", () => {
  it("should rate a snack as guest", async () => {
    const snack = await createSnack();
    const authorId = uuidv7();

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, authorId, authorType: "guest" },
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
    const authorId = uuidv7();

    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 2, authorId, authorType: "guest" },
      repository,
      db,
    );
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, authorId, authorType: "guest" },
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
      { snackItemId: snack.id, rating: 1, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 2, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 3, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, authorId: uuidv7(), authorType: "guest" },
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
      { snackItemId: snack.id, rating: 3, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );

    const dbSnack = await db.query.snackItems.findFirst({
      where: { slug: snack.slug },
    });
    expect(Number(dbSnack?.avgRating)).toBe(3);
  });

  it("should require authorId and authorType at type level", () => {
    // @ts-expect-error — authorId and authorType are required params
    const call = () => rateSnackUseCase({ snackItemId: "x", rating: 4 }, repository, db);
    expect(call).toBeDefined();
  });

  it("should save optional comment body with the rating", async () => {
    const snack = await createSnack();
    const authorId = uuidv7();

    const result = await rateSnackUseCase(
      {
        snackItemId: snack.id,
        rating: 5,
        body: "  Super chrupki  ",
        authorId,
        authorType: "guest",
      },
      repository,
      db,
    );

    expect(result.rating.value).toBe(5);
    expect(result.rating.body).toBe("Super chrupki");

    const ratings = await repository.getRatingsForSnack({
      snackItemId: snack.id,
      authorId,
      authorType: "guest",
    });

    expect(ratings.userRating?.value).toBe(5);
    expect(ratings.userRating?.body).toBe("Super chrupki");
  });

  it("should store null body when comment text is empty", async () => {
    const snack = await createSnack();

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 3, body: "   ", authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );

    expect(result.rating.body).toBeNull();
  });

  it("should accept the minimum rating of 1", async () => {
    const snack = await createSnack();

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 1, authorId: uuidv7(), authorType: "guest" },
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

    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, authorId: uuidv7(), authorType: "guest" },
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

    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 1, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 2, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );
    const result = await rateSnackUseCase(
      { snackItemId: snack.id, rating: 4, authorId: uuidv7(), authorType: "guest" },
      repository,
      db,
    );

    expect(result.avgRating).toBe(2.33);
  });

  it("should soft-delete the previous rating when the same guest re-rates", async () => {
    const snack = await createSnack();
    const guestId = uuidv7();

    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 2, authorId: guestId, authorType: "guest" },
      repository,
      db,
    );
    await rateSnackUseCase(
      { snackItemId: snack.id, rating: 5, authorId: guestId, authorType: "guest" },
      repository,
      db,
    );

    const rows = await db.query.snackComments.findMany({
      where: { snackItemId: snack.id, authorId: guestId, rating: { isNotNull: true } },
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
      rateSnackUseCase(
        { snackItemId: snack.id, rating: 0, authorId: uuidv7(), authorType: "guest" },
        repository,
        db,
      ),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw for a rating above the maximum", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase(
        { snackItemId: snack.id, rating: 6, authorId: uuidv7(), authorType: "guest" },
        repository,
        db,
      ),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw for a non-integer rating", async () => {
    const snack = await createSnack();

    expect(() =>
      rateSnackUseCase(
        { snackItemId: snack.id, rating: 2.5, authorId: uuidv7(), authorType: "guest" },
        repository,
        db,
      ),
    ).toThrow("Rating must be an integer between 1 and 5");
  });

  it("should throw when authorId is an empty string", async () => {
    const snack = await createSnack();

    await expect(
      rateSnackUseCase(
        { snackItemId: snack.id, rating: 4, authorId: "", authorType: "guest" },
        repository,
        db,
      ),
    ).rejects.toThrow("Either authorId with authorType must be provided");
  });

  it("should reject when the snack does not exist", async () => {
    const missingSnackId = "00000000-0000-0000-0000-000000000000";

    await expect(
      rateSnackUseCase(
        { snackItemId: missingSnackId, rating: 4, authorId: uuidv7(), authorType: "guest" },
        repository,
        db,
      ),
    ).rejects.toThrow("Failed query");
  });
});
