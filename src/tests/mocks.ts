import { vi } from "vitest";

vi.mock("#/infrastructure/s3-client", () => ({
  uploadPrivateFile: vi.fn<(key: string, body: Buffer) => Promise<void>>().mockResolvedValue(),
  getPrivateFileUrl: vi
    .fn<(key: string) => Promise<string>>()
    .mockResolvedValue("https://test.com/file"),
}));
