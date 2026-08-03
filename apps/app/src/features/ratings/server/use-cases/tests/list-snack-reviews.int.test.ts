import { snackComments } from "@snack-rate/db-schema/schema";
import { eq } from "drizzle-orm";
import type { InferInsertModel } from "drizzle-orm";

import { createRatingsRepository } from "#/features/ratings/server/repositories/ratings.repository";
import { listSnackReviewsUseCase } from "#/features/ratings/server/use-cases/list-snack-reviews.use-case";
import type { Database } from "#/infrastructure/db/db";
import { createSnack, createUser } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

let db: Database;
let repository: ReturnType<typeof createRatingsRepository>;

beforeAll(() => {
  db = getDb();
  repository = createRatingsRepository({ db });
});

async function insertComment(
  snackItemId: string,
  overrides?: Partial<InferInsertModel<typeof snackComments>>,
) {
  const [comment] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      rating: 4,
      ...overrides,
    })
    .returning();
  return comment;
}

describe("list snack reviews", () => {
  it("should return empty items when no reviews exist", async () => {
    const snack = await createSnack();

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items).toEqual([]);
    expect(result.nextCursor).toBeNull();
  });

  it("should return reviews with author name from user", async () => {
    const snack = await createSnack();
    const user = await createUser({ firstName: "Anna", lastName: "Nowak" });

    await insertComment(snack.id, { userId: user.id, body: "Super produkt", rating: 5 });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({
      authorName: "Anna Nowak",
      rating: 5,
      body: "Super produkt",
    });
    expect(result.items[0].isEdited).toBe(false);
  });

  it("should display Gość for guest reviews", async () => {
    const snack = await createSnack();

    await insertComment(snack.id, { guestId: "guest-1", body: "Anonimowa recenzja", rating: 3 });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items[0].authorName).toBe("Gość");
  });

  it("should order reviews newest first", async () => {
    const snack = await createSnack();

    const older = await insertComment(snack.id, {
      guestId: "g1",
      rating: 3,
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
    });
    const newer = await insertComment(snack.id, {
      guestId: "g2",
      rating: 5,
      createdAt: new Date("2026-01-02T00:00:00.000Z"),
    });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items.map((review) => review.id)).toEqual([newer.id, older.id]);
  });

  it("should group replies under their parent review and exclude rating-less comments from top level", async () => {
    const snack = await createSnack();
    const author = await createUser();
    const replyAuthor = await createUser({ firstName: "Ewa", lastName: "Kamińska" });

    const review = await insertComment(snack.id, {
      userId: author.id,
      body: "Recenzja",
      rating: 4,
    });
    await insertComment(snack.id, {
      guestId: "guest-plain",
      body: "Zwykły komentarz",
      rating: null,
    });
    await insertComment(snack.id, {
      parentCommentId: review.id,
      userId: replyAuthor.id,
      body: "Odpowiedź",
      rating: null,
    });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items).toHaveLength(1);
    expect(result.items[0].id).toBe(review.id);
    expect(result.items[0].repliesCount).toBe(1);
    expect(result.items[0].replies).toHaveLength(1);
    expect(result.items[0].replies[0]).toMatchObject({
      authorName: "Ewa Kamińska",
      body: "Odpowiedź",
    });
  });

  it("should exclude soft-deleted reviews and replies", async () => {
    const snack = await createSnack();

    const review = await insertComment(snack.id, { guestId: "g1", body: "Usunięta", rating: 5 });
    const reply = await insertComment(snack.id, {
      parentCommentId: review.id,
      guestId: "g2",
      body: "Usunięta odpowiedź",
      rating: null,
    });
    await db
      .update(snackComments)
      .set({ deletedAt: new Date() })
      .where(eq(snackComments.id, review.id));
    await db
      .update(snackComments)
      .set({ deletedAt: new Date() })
      .where(eq(snackComments.id, reply.id));
    await insertComment(snack.id, { guestId: "g3", body: "Aktywna", rating: 3 });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items).toHaveLength(1);
    expect(result.items[0]).toMatchObject({ rating: 3, body: "Aktywna" });
    expect(result.items[0].replies).toEqual([]);
  });

  it("should mark review as edited when updatedAt is later than createdAt", async () => {
    const snack = await createSnack();
    const createdAt = new Date("2026-01-01T10:00:00.000Z");

    const untouched = await insertComment(snack.id, {
      guestId: "g1",
      rating: 4,
      createdAt,
      updatedAt: createdAt,
    });
    const edited = await insertComment(snack.id, {
      guestId: "g2",
      rating: 5,
      createdAt,
      updatedAt: new Date("2026-01-02T10:00:00.000Z"),
    });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    const byId = new Map(result.items.map((review) => [review.id, review]));
    expect(byId.get(edited.id)?.isEdited).toBe(true);
    expect(byId.get(untouched.id)?.isEdited).toBe(false);
  });

  it("should paginate reviews with cursor without duplicates", async () => {
    const snack = await createSnack();

    const reviews = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        insertComment(snack.id, {
          guestId: `guest-${index}`,
          rating: (index % 5) + 1,
          body: `Recenzja ${index}`,
          createdAt: new Date(2026, 0, 1 + index, 12, 0, 0),
        }),
      ),
    );

    const page1 = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 2 }, repository);
    expect(page1.items).toHaveLength(2);
    expect(page1.nextCursor).not.toBeNull();

    const page2 = await listSnackReviewsUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { snackItemId: snack.id, limit: 2, cursor: page1.nextCursor ?? undefined },
      repository,
    );
    expect(page2.items).toHaveLength(2);
    expect(page2.nextCursor).not.toBeNull();

    const page3 = await listSnackReviewsUseCase(
      // oxlint-disable-next-line vitest/no-conditional-in-test
      { snackItemId: snack.id, limit: 2, cursor: page2.nextCursor ?? undefined },
      repository,
    );
    expect(page3.items).toHaveLength(1);
    expect(page3.nextCursor).toBeNull();

    const collected = [...page1.items, ...page2.items, ...page3.items].map((review) => review.id);

    expect(collected).toHaveLength(5);
    expect(new Set(collected).size).toBe(5);
    expect(new Set(collected)).toEqual(new Set(reviews.map((review) => review.id)));
  });

  it("should return null nextCursor when all reviews fit in the page", async () => {
    const snack = await createSnack();

    await insertComment(snack.id, { guestId: "g1", rating: 4 });

    const result = await listSnackReviewsUseCase({ snackItemId: snack.id, limit: 10 }, repository);

    expect(result.items).toHaveLength(1);
    expect(result.nextCursor).toBeNull();
  });
});
