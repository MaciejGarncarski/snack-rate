import { createRouterClient } from "@orpc/server";
import { snackComments } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import { addReplyProcedure } from "#/features/comments/comments.routes.server";
import type { CommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import { createCommentsRepository } from "#/features/comments/server/repositories/comments.repository";
import type { Database } from "#/infrastructure/db/db";
import { createSnack } from "#/tests/fixtures";
import { getDb } from "#/tests/setup.int";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn<(options: { headers: Headers }) => Promise<unknown>>(),
  verifyTurnstileToken: vi.fn<(options: { token: string }) => Promise<boolean>>(),
  repository: null as unknown as CommentsRepository,
}));

vi.mock("#/lib/cookie.config", () => ({
  cookies: {
    guestId: {
      name: "guest_id",
      options: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 31536000, path: "/" },
    },
    adminAuth: {
      name: "admin_auth",
      options: { httpOnly: true, secure: false, sameSite: "lax", maxAge: 86400, path: "/" },
    },
  },
}));

vi.mock("#/lib/auth.ts", () => ({
  auth: { api: { getSession: mocks.getSession } },
}));

vi.mock("#/infrastructure/turnstile", () => ({
  verifyTurnstileToken: mocks.verifyTurnstileToken,
}));

vi.mock("#/features/comments/server/repositories/comments.repository.instance", () => ({
  get commentsRepository() {
    if (!mocks.repository) {
      throw new Error("commentsRepository accessed before test setup");
    }
    return mocks.repository;
  },
}));

let db: Database;

beforeAll(() => {
  db = getDb();
  mocks.repository = createCommentsRepository({ db });
});

beforeEach(() => {
  mocks.getSession.mockReset().mockResolvedValue(null);
  mocks.verifyTurnstileToken.mockReset().mockResolvedValue(true);
});

function createCaller(guestId: string) {
  return createRouterClient(
    { comments: { addReply: addReplyProcedure } },
    {
      context: {
        requestHeaders: new Headers({ cookie: `guest_id=${guestId}` }),
        guestId: null,
        userId: null,
        role: "guest" as const,
      },
    },
  );
}

async function insertParentComment(
  snackItemId: string,
  overrides?: Partial<InferInsertModel<typeof snackComments>>,
) {
  const [comment] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      rating: 7,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Recenzja",
      ...overrides,
    })
    .returning();
  return comment;
}

describe("add reply procedure", () => {
  it("should create a reply as guest linked to the parent comment", async () => {
    const snack = await createSnack();
    const guestId = uuidv7();
    const parent = await insertParentComment(snack.id);
    const caller = createCaller(guestId);

    const result = await caller.comments.addReply({
      snackItemId: snack.id,
      commentId: parent.id,
      body: "Świetna recenzja!",
      token: "test-token",
    });

    expect(mocks.verifyTurnstileToken).toHaveBeenCalledWith({ token: "test-token" });
    expect(result).toMatchObject({
      parentCommentId: parent.id,
      snackItemId: snack.id,
      body: "Świetna recenzja!",
      authorId: guestId,
      authorType: "guest",
    });

    const rows = await db.query.snackComments.findMany({
      where: { parentCommentId: parent.id },
    });
    expect(rows).toHaveLength(1);
    expect(rows[0].body).toBe("Świetna recenzja!");
  });

  it("should create a reply as authenticated user", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    mocks.getSession.mockResolvedValue({ user: { id: "user-123", role: "user" } });
    const caller = createCaller(uuidv7());

    const result = await caller.comments.addReply({
      snackItemId: snack.id,
      commentId: parent.id,
      body: "Zgadzam się w pełni",
      token: "test-token",
    });

    expect(result).toMatchObject({
      parentCommentId: parent.id,
      authorId: "user-123",
      authorType: "user",
    });
  });

  it("should reject with BAD_REQUEST when turnstile verification fails", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    mocks.verifyTurnstileToken.mockResolvedValueOnce(false);
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.addReply({
        snackItemId: snack.id,
        commentId: parent.id,
        body: "Bot?",
        token: "bad-token",
      }),
    ).rejects.toMatchObject({
      code: "BAD_REQUEST",
      message: "Nie udało się zweryfikować użytkownika",
    });

    const rows = await db.query.snackComments.findMany({
      where: { parentCommentId: parent.id },
    });
    expect(rows).toHaveLength(0);
  });

  it("should reject an empty body", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.addReply({
        snackItemId: snack.id,
        commentId: parent.id,
        body: "",
        token: "test-token",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("should reject a body longer than 1000 characters", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.addReply({
        snackItemId: snack.id,
        commentId: parent.id,
        body: "a".repeat(1001),
        token: "test-token",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("should reject a non-uuid comment id", async () => {
    const snack = await createSnack();
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.addReply({
        snackItemId: snack.id,
        commentId: "not-a-uuid",
        body: "Hej",
        token: "test-token",
      }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
