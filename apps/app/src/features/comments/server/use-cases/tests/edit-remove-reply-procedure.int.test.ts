import { createRouterClient } from "@orpc/server";
import { snackComments } from "@snack-rate/db-schema/schema";
import type { InferInsertModel } from "drizzle-orm";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import {
  editReplyProcedure,
  removeReplyProcedure,
} from "#/features/comments/comments.routes.server";
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
    { comments: { editReply: editReplyProcedure, removeReply: removeReplyProcedure } },
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

async function insertReply(
  snackItemId: string,
  parentCommentId: string,
  overrides?: Partial<InferInsertModel<typeof snackComments>>,
) {
  const [reply] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      parentCommentId,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Odpowiedź",
      ...overrides,
    })
    .returning();
  return reply;
}

async function insertParentComment(snackItemId: string) {
  const [comment] = await db
    .insert(snackComments)
    .values({
      snackItemId,
      rating: 7,
      authorId: uuidv7(),
      authorType: "guest",
      body: "Recenzja",
    })
    .returning();
  return comment;
}

describe("edit reply procedure", () => {
  it("should update an own reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const guestId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId: guestId });
    const caller = createCaller(guestId);

    const result = await caller.comments.editReply({
      replyId: reply.id,
      body: "Poprawiona treść",
      token: "test-token",
    });

    expect(mocks.verifyTurnstileToken).toHaveBeenCalledWith({ token: "test-token" });
    expect(result.body).toBe("Poprawiona treść");
  });

  it("should reject editing someone else's reply with FORBIDDEN", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const reply = await insertReply(snack.id, parent.id, { body: "Cudza odpowiedź" });
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.editReply({ replyId: reply.id, body: "Podmiana", token: "test-token" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("should reject with BAD_REQUEST when turnstile verification fails", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const guestId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId: guestId });
    mocks.verifyTurnstileToken.mockResolvedValueOnce(false);
    const caller = createCaller(guestId);

    await expect(
      caller.comments.editReply({ replyId: reply.id, body: "Nowa", token: "bad-token" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("should reject an empty body", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const guestId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId: guestId });
    const caller = createCaller(guestId);

    await expect(
      caller.comments.editReply({ replyId: reply.id, body: "", token: "test-token" }),
    ).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("should reject a missing reply with NOT_FOUND", async () => {
    const caller = createCaller(uuidv7());

    await expect(
      caller.comments.editReply({ replyId: uuidv7(), body: "Nowa", token: "test-token" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("remove reply procedure", () => {
  it("should soft-delete an own reply", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const guestId = uuidv7();
    const reply = await insertReply(snack.id, parent.id, { authorId: guestId });
    const caller = createCaller(guestId);

    await caller.comments.removeReply({ replyId: reply.id });

    const stored = await db.query.snackComments.findFirst({ where: { id: reply.id } });
    expect(stored?.deletedAt).not.toBeNull();
  });

  it("should reject removing someone else's reply with FORBIDDEN", async () => {
    const snack = await createSnack();
    const parent = await insertParentComment(snack.id);
    const reply = await insertReply(snack.id, parent.id);
    const caller = createCaller(uuidv7());

    await expect(caller.comments.removeReply({ replyId: reply.id })).rejects.toMatchObject({
      code: "FORBIDDEN",
    });
  });

  it("should reject a missing reply with NOT_FOUND", async () => {
    const caller = createCaller(uuidv7());

    await expect(caller.comments.removeReply({ replyId: uuidv7() })).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
  });
});
