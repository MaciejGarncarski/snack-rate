import { Readable } from "node:stream";
import { vi } from "vitest";

const MINIMAL_PNG = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49, 0x48, 0x44, 0x52,
  0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x02, 0x00, 0x00, 0x00, 0x90, 0x77, 0x53,
  0xde, 0x00, 0x00, 0x00, 0x0c, 0x49, 0x44, 0x41, 0x54, 0x08, 0xd7, 0x63, 0xf8, 0xcf, 0xc0, 0x00,
  0x00, 0x00, 0x02, 0x00, 0x01, 0xe2, 0x21, 0xbc, 0x33, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4e,
  0x44, 0xae, 0x42, 0x60, 0x82,
]);

function createMockStream(buffer: Uint8Array) {
  const readable = Readable.from(Buffer.from(buffer));
  return Readable.toWeb(readable) as ReadableStream<Uint8Array>;
}

vi.mock("#/infrastructure/s3-client", () => ({
  uploadPublicFile: vi.fn<(key: string, body: Buffer) => Promise<void>>().mockResolvedValue(),
  uploadPublicFileStream: vi.fn<() => Promise<void>>().mockResolvedValue(),
  deletePublicFile: vi.fn<(key: string) => Promise<void>>().mockResolvedValue(),
  getPublicFileUrl: vi.fn<(key: string) => string>().mockReturnValue("https://test.com/file"),
  getPublicFileStream: vi
    .fn<
      (
        key: string,
      ) => Promise<{
        stream: ReadableStream;
        contentType: string | undefined;
        contentLength: number | undefined;
      }>
    >()
    .mockResolvedValue({
      stream: createMockStream(MINIMAL_PNG),
      contentType: "image/png",
      contentLength: MINIMAL_PNG.byteLength,
    }),
  copyPublicFile: vi.fn<(oldKey: string, newKey: string) => Promise<void>>().mockResolvedValue(),
  movePublicFile: vi.fn<(oldKey: string, newKey: string) => Promise<void>>().mockResolvedValue(),
}));

vi.mock("sharp", () => {
  const sharpInstance = {
    metadata: vi
      .fn<() => Promise<{ width: number; height: number; format: string }>>()
      .mockResolvedValue({ width: 1024, height: 768, format: "png" }),
    rotate: vi.fn<() => unknown>().mockReturnThis(),
    resize: vi.fn<() => unknown>().mockReturnThis(),
    jpeg: vi.fn<() => unknown>().mockReturnThis(),
    png: vi.fn<() => unknown>().mockReturnThis(),
    webp: vi.fn<() => unknown>().mockReturnThis(),
    toFormat: vi.fn<() => unknown>().mockReturnThis(),
    toBuffer: vi.fn<() => Promise<Buffer>>().mockResolvedValue(Buffer.from("optimized-data")),
  };
  return {
    default: vi.fn<() => unknown>(() => sharpInstance),
  };
});
