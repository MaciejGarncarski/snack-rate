import { vi } from "vitest";

vi.mock("#/infrastructure/s3-client", () => ({
  uploadPrivateFile: vi.fn().mockResolvedValue(undefined),
  getPrivateFileUrl: vi.fn().mockResolvedValue("https://test.com/file"),
}));
