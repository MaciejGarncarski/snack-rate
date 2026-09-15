import { vi } from "vitest";

import { uploadAvatar } from "#/features/auth/server/avatar.service";
import { deletePublicFile, getPublicFileUrl, uploadPublicFile } from "#/infrastructure/s3-client";

vi.mock("#/lib/server.env", () => ({
  serverEnv: { S3_ENDPOINT: "https://s3.test" },
}));

const mockedUpload = vi.mocked(uploadPublicFile);
const mockedDelete = vi.mocked(deletePublicFile);
const mockedUrl = vi.mocked(getPublicFileUrl);

const MINIMAL_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);

function pngFile(name = "avatar.png") {
  return new File([MINIMAL_PNG], name, { type: "image/png" });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockedUrl.mockReturnValue("https://s3.test/avatars/user-1/new.webp");
});

describe("upload avatar", () => {
  it("should process, upload and return the public url", async () => {
    const url = await uploadAvatar(pngFile(), "user-1", null);

    expect(url).toBe("https://s3.test/avatars/user-1/new.webp");
    expect(mockedUpload).toHaveBeenCalledOnce();
    const [key, body] = mockedUpload.mock.calls[0];
    expect(key).toMatch(/^avatars\/user-1\/.+\.webp$/u);
    expect(body).toBeInstanceOf(Buffer);
    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("should delete the previous own avatar", async () => {
    await uploadAvatar(pngFile(), "user-1", "https://s3.test/avatars/user-1/old.webp");

    expect(mockedDelete).toHaveBeenCalledWith("avatars/user-1/old.webp");
  });

  it("should keep a foreign previous image", async () => {
    await uploadAvatar(pngFile(), "user-1", "https://cdn.discordapp.com/avatars/123/abc.png");

    expect(mockedDelete).not.toHaveBeenCalled();
  });

  it("should reject a non-image file", async () => {
    const file = new File(["hello"], "avatar.txt", { type: "text/plain" });

    await expect(uploadAvatar(file, "user-1", null)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mockedUpload).not.toHaveBeenCalled();
  });

  it("should reject an oversized file", async () => {
    const big = new Uint8Array(2 * 1024 * 1024 + 1);
    big.set(MINIMAL_PNG);
    const file = new File([big], "avatar.png", { type: "image/png" });

    await expect(uploadAvatar(file, "user-1", null)).rejects.toMatchObject({
      code: "BAD_REQUEST",
    });
    expect(mockedUpload).not.toHaveBeenCalled();
  });
});
