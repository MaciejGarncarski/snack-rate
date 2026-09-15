import { createRouterClient } from "@orpc/server";
import { uuidv7 } from "uuidv7";
import { vi } from "vitest";

import { uploadAvatarProcedure } from "#/features/auth/auth.routes.server";
import { deletePublicFile, uploadPublicFile } from "#/infrastructure/s3-client";

const mocks = vi.hoisted(() => ({
  getSession: vi.fn<(options: { headers: Headers }) => Promise<unknown>>(),
  updateUser: vi.fn<(options: { headers: Headers; body: { image: string } }) => Promise<unknown>>(),
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

// oxlint-disable-next-line anti-slop/no-module-mocking -- avatar key cleanup reads the S3 endpoint from serverEnv, which is unavailable in tests
vi.mock("#/lib/server.env", () => ({
  serverEnv: { S3_ENDPOINT: "https://s3.test" },
}));

const mockedUpload = vi.mocked(uploadPublicFile);
const mockedDelete = vi.mocked(deletePublicFile);

const MINIMAL_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);

function pngFile() {
  return new File([MINIMAL_PNG], "avatar.png", { type: "image/png" });
}

function createCaller() {
  return createRouterClient(
    { auth: { uploadAvatar: uploadAvatarProcedure } },
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
  mocks.getSession.mockReset().mockResolvedValue({ user: { id: "user-1", image: null } });
  mocks.updateUser.mockReset().mockResolvedValue({ status: true });
});

describe("upload avatar procedure", () => {
  it("should upload the avatar and sync it with the auth profile", async () => {
    const caller = createCaller();

    const result = await caller.auth.uploadAvatar({ image: pngFile() });

    expect(result.image).toBe("https://test.com/file");
    expect(mockedUpload).toHaveBeenCalledOnce();
    const [key] = mockedUpload.mock.calls[0];
    expect(key).toMatch(/^avatars\/user-1\/.+\.webp$/u);
    expect(mocks.updateUser).toHaveBeenCalledWith(
      expect.objectContaining({ body: { image: "https://test.com/file" } }),
    );
  });

  it("should remove the previous own avatar", async () => {
    mocks.getSession.mockResolvedValue({
      user: { id: "user-1", image: "https://s3.test/avatars/user-1/old.webp" },
    });
    const caller = createCaller();

    await caller.auth.uploadAvatar({ image: pngFile() });

    expect(mockedDelete).toHaveBeenCalledWith("avatars/user-1/old.webp");
  });

  it("should reject unauthenticated callers with UNAUTHORIZED", async () => {
    mocks.getSession.mockResolvedValue(null);
    const caller = createCaller();

    await expect(caller.auth.uploadAvatar({ image: pngFile() })).rejects.toMatchObject({
      code: "UNAUTHORIZED",
    });
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("should reject a non-image file with BAD_REQUEST", async () => {
    const caller = createCaller();
    const file = new File(["hello"], "avatar.txt", { type: "text/plain" });

    await expect(caller.auth.uploadAvatar({ image: file })).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mocks.updateUser).not.toHaveBeenCalled();
  });
});
