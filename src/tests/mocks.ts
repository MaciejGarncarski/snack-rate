import { vi } from "vitest";

vi.mock("#/infrastructure/s3-client", () => ({
  uploadPublicFile: vi.fn<(key: string, body: Buffer) => Promise<void>>().mockResolvedValue(),
  getPublicFileUrl: vi.fn<(key: string) => string>().mockReturnValue("https://test.com/file"),
}));

vi.mock("sharp", () => {
  const sharpInstance = {
    metadata: vi
      .fn<() => Promise<{ width: number; height: number; format: string }>>()
      .mockResolvedValue({ width: 1024, height: 768, format: "png" }),
    resize: vi.fn<() => unknown>().mockReturnThis(),
    jpeg: vi.fn<() => unknown>().mockReturnThis(),
    png: vi.fn<() => unknown>().mockReturnThis(),
    webp: vi.fn<() => unknown>().mockReturnThis(),
    toBuffer: vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from("thumbnail-data")),
  };
  return {
    default: vi.fn<() => unknown>(() => sharpInstance),
  };
});
