import { snackComments } from "@snack-rate/db-schema/schema";
import { eq } from "drizzle-orm";

import { createRatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { getSnackRatingsUseCase } from "#/features/ratings/server/use-cases/get-snack-rating.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createRatingsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createRatingsRepository({ db });
});

async function insertRating(
  snackItemId: string,
  rating: number,
  overrides?: { userId?: string; guestId?: string },
) {
  await db.insert(snackComments).values({
    snackItemId,
    userId: overrides?.userId ?? null,
    guestId: overrides?.guestId ?? null,
    rating,
  });
}

describe("get snack ratings", () => {
  it("should return zeros when no ratings exist", async () => {
    const snack = await createSnack();

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "guest-none" },
      repository,
    );

    expect(result.avgRating).toBe(0);
    expect(result.ratingCount).toBe(0);
    expect(result.distribution).toEqual({});
    expect(result.userRating).toBeNull();
    expect(result.userBody).toBeNull();
  });

  it("should return correct average and count", async () => {
    const snack = await createSnack();

    await insertRating(snack.id, 4, { guestId: "a" });
    await insertRating(snack.id, 2, { guestId: "b" });
    await insertRating(snack.id, 3, { guestId: "c" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "a" },
      repository,
    );

    expect(result.avgRating).toBe(3);
    expect(result.ratingCount).toBe(3);
  });

  it("should return distribution of ratings", async () => {
    const snack = await createSnack();

    await insertRating(snack.id, 1, { guestId: "a" });
    await insertRating(snack.id, 1, { guestId: "b" });
    await insertRating(snack.id, 5, { guestId: "c" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "a" },
      repository,
    );

    expect(result.distribution).toEqual({
      "1": 2,
      "5": 1,
    });
  });

  it("should return userRating for the requesting guest", async () => {
    const snack = await createSnack();

    await insertRating(snack.id, 5, { guestId: "alice" });
    await insertRating(snack.id, 3, { guestId: "bob" });

    const aliceResult = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "alice" },
      repository,
    );
    expect(aliceResult.userRating).toBe(5);
    expect(aliceResult.userBody).toBeNull();

    const bobResult = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "bob" },
      repository,
    );
    expect(bobResult.userRating).toBe(3);
    expect(bobResult.userBody).toBeNull();
  });

  it("should return userBody for the requesting guest", async () => {
    const snack = await createSnack();

    await db.insert(snackComments).values({
      snackItemId: snack.id,
      guestId: "alice",
      rating: 4,
      body: "Pyszny, ale drogi.",
    });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "alice" },
      repository,
    );

    expect(result.userRating).toBe(4);
    expect(result.userBody).toBe("Pyszny, ale drogi.");
  });

  it("should exclude soft-deleted ratings from aggregation", async () => {
    const snack = await createSnack();

    await insertRating(snack.id, 5, { guestId: "bob" });
    await insertRating(snack.id, 3, { guestId: "carol" });
    await insertRating(snack.id, 1, { guestId: "dave" });
    await db
      .update(snackComments)
      .set({ deletedAt: new Date() })
      .where(eq(snackComments.rating, 5));

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "carol" },
      repository,
    );

    expect(result.avgRating).toBe(2);
    expect(result.ratingCount).toBe(2);
    expect(result.userRating).toBe(3);
  });

  it("should return null userRating when guest has not rated", async () => {
    const snack = await createSnack();

    await insertRating(snack.id, 4, { guestId: "someone" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, guestId: "stranger" },
      repository,
    );

    expect(result.userRating).toBeNull();
    expect(result.ratingCount).toBe(1);
  });
});
