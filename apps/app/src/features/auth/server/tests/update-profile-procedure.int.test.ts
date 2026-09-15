import { createRouterClient } from "@orpc/server";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import { updateProfileProcedure } from "#/features/auth/auth.routes.server";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn<(options: { headers: Headers }) => Promise<unknown>>(),
  updateUser: vi.fn<(options: { headers: Headers; body: { name: string } }) => Promise<unknown>>(),
}));

// oxlint-disable-next-line anti-slop/no-module-mocking -- cookie options read serverEnv at import time, which is unavailable in tests; the cookie name stays real
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

// oxlint-disable-next-line anti-slop/no-module-mocking -- procedure test must not boot better-auth against the prod DB
vi.mock("#/lib/auth.ts", () => ({
  auth: { api: { getSession: mocks.getSession, updateUser: mocks.updateUser } },
}));

function createCaller() {
  return createRouterClient(
    { auth: { updateProfile: updateProfileProcedure } },
    {
      context: {
        requestHeaders: new Headers({ cookie: `guest_id=${uuidv7()}` }),
        guestId: null,
        userId: null,
        role: "guest" as const,
      },
    },
  );
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getSession.mockReset().mockResolvedValue({ user: { id: "user-1", name: "Jan" } });
  mocks.updateUser.mockReset().mockResolvedValue({ status: true });
});

describe("update profile procedure", () => {
  it("should update the nickname and sync it with the auth profile", async () => {
    const caller = createCaller();

    const result = await caller.auth.updateProfile({ name: "  Ania  " });

    expect(result).toEqual({ name: "Ania" });
    expect(mocks.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { name: "Ania" } }),
    );
  });

  it("should reject unauthenticated callers with UNAUTHORIZED", async () => {
    mocks.getSession.mockResolvedValue(null);
    const caller = createCaller();

    await expect(caller.auth.updateProfile({ name: "Ania" })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });

  it("should reject a blank nickname with BAD_REQUEST", async () => {
    const caller = createCaller();

    await expect(caller.auth.updateProfile({ name: "   " })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
