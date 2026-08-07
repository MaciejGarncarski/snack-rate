import { snackComments } from "@snack-rate/db-schema/schema";
import { eq } from "drizzle-orm";
import { uuidv7 } from "uuidv7";

import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { getSnackRatingsUseCase } from "#/features/comments/server/use-cases/get-snack-comments.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createCommentsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createCommentsRepository({ db });
});

async function insertRating(
  snackItemId: string,
  rating: number,
  overrides: { authorId: string; authorType: "user" | "guest" },
) {
  await db.insert(snackComments).values({
    snackItemId,
    authorId: overrides.authorId,
    authorType: overrides.authorType,
    rating,
  });
}

describe("get snack ratings", () => {
  it("should return zeros when no ratings exist", async () => {
    const snack = await createSnack();

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: uuidv7(), authorType: "guest" },
      repository,
    );

    expect(result.avgRating).toBe(0);
    expect(result.ratingCount).toBe(0);
    expect(result.distribution).toEqual({});
    expect(result.userRating).toBeNull();
  });

  it("should return correct average and count", async () => {
    const snack = await createSnack();
    const alice = uuidv7();

    await insertRating(snack.id, 4, { authorId: alice, authorType: "guest" });
    await insertRating(snack.id, 2, { authorId: uuidv7(), authorType: "guest" });
    await insertRating(snack.id, 3, { authorId: uuidv7(), authorType: "guest" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: alice, authorType: "guest" },
      repository,
    );

    expect(result.avgRating).toBe(3);
    expect(result.ratingCount).toBe(3);
  });

  it("should return distribution of ratings", async () => {
    const snack = await createSnack();
    const alice = uuidv7();

    await insertRating(snack.id, 1, { authorId: alice, authorType: "guest" });
    await insertRating(snack.id, 1, { authorId: uuidv7(), authorType: "guest" });
    await insertRating(snack.id, 5, { authorId: uuidv7(), authorType: "guest" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: alice, authorType: "guest" },
      repository,
    );

    expect(result.distribution).toEqual({
      "1": 2,
      "5": 1,
    });
  });

  it("should return userRating for the requesting guest", async () => {
    const snack = await createSnack();
    const alice = uuidv7();
    const bob = uuidv7();

    await insertRating(snack.id, 5, { authorId: alice, authorType: "guest" });
    await insertRating(snack.id, 3, { authorId: bob, authorType: "guest" });

    const aliceResult = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: alice, authorType: "guest" },
      repository,
    );
    expect(aliceResult.userRating?.value).toBe(5);
    expect(aliceResult.userRating?.body).toBeNull();

    const bobResult = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: bob, authorType: "guest" },
      repository,
    );
    expect(bobResult.userRating?.value).toBe(3);
    expect(bobResult.userRating?.body).toBeNull();
  });

  it("should return userBody for the requesting guest", async () => {
    const snack = await createSnack();
    const alice = uuidv7();

    await db.insert(snackComments).values({
      snackItemId: snack.id,
      authorId: alice,
      authorType: "guest",
      rating: 4,
      body: "Pyszny, ale drogi.",
    });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: alice, authorType: "guest" },
      repository,
    );

    expect(result.userRating?.value).toBe(4);
    expect(result.userRating?.body).toBe("Pyszny, ale drogi.");
  });

  it("should exclude soft-deleted ratings from aggregation", async () => {
    const snack = await createSnack();
    const bob = uuidv7();
    const carol = uuidv7();
    const dave = uuidv7();

    await insertRating(snack.id, 5, { authorId: bob, authorType: "guest" });
    await insertRating(snack.id, 3, { authorId: carol, authorType: "guest" });
    await insertRating(snack.id, 1, { authorId: dave, authorType: "guest" });
    await db
      .update(snackComments)
      .set({ deletedAt: new Date() })
      .where(eq(snackComments.rating, 5));

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: carol, authorType: "guest" },
      repository,
    );

    expect(result.avgRating).toBe(2);
    expect(result.ratingCount).toBe(2);
    expect(result.userRating?.value).toBe(3);
  });

  it("should return null userRating when guest has not rated", async () => {
    const snack = await createSnack();
    const someone = uuidv7();
    const stranger = uuidv7();

    await insertRating(snack.id, 4, { authorId: someone, authorType: "guest" });

    const result = await getSnackRatingsUseCase(
      { snackItemId: snack.id, authorId: stranger, authorType: "guest" },
      repository,
    );

    expect(result.userRating).toBeNull();
    expect(result.ratingCount).toBe(1);
  });
});
