import { vi } from "vitest";

vi.mock("#/infrastructure/s3-client", () => ({
  uploadPrivateFile: vi.fn<(key: string, body: Buffer) => Promise<void>>().mockResolvedValue(),
  getPrivateFileUrl: vi
    .fn<(key: string) => Promise<string>>()
    .mockResolvedValue("https://test.com/file"),
}));

vi.mock("sharp", () => {
  const sharpInstance = {
    metadata: vi.fn<() => Promise<{ width: number; height: number; format: string }>>().mockResolvedValue({ width: 1024, height: 768, format: "jpeg" }),
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
