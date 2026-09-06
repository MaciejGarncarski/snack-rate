// @vitest-environment jsdom
import { OPTIMIZED_QUALITY } from "#/const/image-const";
import { convertToWebp } from "#/features/catalogue/create-snack/utils/convert-to-webp";
import { validateImage } from "#/features/catalogue/create-snack/utils/validate-image";

const BITMAP = { width: 800, height: 600, close: vi.fn<() => void>() };

function mockCanvas() {
  const drawImage = vi.fn<(...args: unknown[]) => void>();
  const fillRect = vi.fn<(...args: unknown[]) => void>();
  const getContext = vi.fn<(contextId: string) => unknown>();
  const toBlobCalls: { type: string; quality: number | undefined }[] = [];
  const toBlob = vi.fn<(cb: (blob: Blob | null) => void, type: string, quality?: number) => void>(
    (cb, type, quality) => {
      toBlobCalls.push({ type, quality });
      cb(new Blob(["webp-bytes"], { type }));
    },
  );

  const canvas = {
    width: 0,
    height: 0,
    getContext,
    toBlob,
  };
  getContext.mockReturnValue({ drawImage, fillRect });

  return { canvas, drawImage, fillRect, toBlobCalls };
}

describe("convertToWebp", () => {
  it("preserves transparency: webp output, no background fill", async () => {
    const { canvas, drawImage, fillRect, toBlobCalls } = mockCanvas();
    vi.stubGlobal(
      "createImageBitmap",
      vi.fn<(blob: Blob) => Promise<unknown>>().mockResolvedValue(BITMAP),
    );
    vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);

    const file = new File(["bmp-bytes"], "photo.bmp", { type: "image/bmp" });
    const result = await convertToWebp(file);

    expect(result.type).toBe("image/webp");
    expect(result.name).toBe("photo.webp");
    expect(drawImage).toHaveBeenCalledTimes(1);
    expect(fillRect).not.toHaveBeenCalled();
    expect(toBlobCalls[0]?.type).toBe("image/webp");
    expect(toBlobCalls[0]?.quality).toBeCloseTo(OPTIMIZED_QUALITY / 100);

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("downscales to the output bounding box", async () => {
    const { canvas } = mockCanvas();
    vi.stubGlobal(
      "createImageBitmap",
      vi
        .fn<(blob: Blob) => Promise<unknown>>()
        .mockResolvedValue({ width: 4000, height: 3000, close: vi.fn<() => void>() }),
    );
    vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);

    const file = new File(["x"], "huge.png", { type: "image/png" });
    await convertToWebp(file);

    expect(Math.max(canvas.width, canvas.height)).toBeLessThanOrEqual(1200);

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});

describe("validateImage with conversion", () => {
  it("converts an unsupported-but-decodable image to webp instead of rejecting", async () => {
    const { canvas } = mockCanvas();
    vi.stubGlobal(
      "createImageBitmap",
      vi
        .fn<(blob: Blob) => Promise<unknown>>()
        .mockResolvedValue({ width: 800, height: 600, close: vi.fn<() => void>() }),
    );
    vi.spyOn(document, "createElement").mockReturnValue(canvas as unknown as HTMLCanvasElement);

    class OkImage {
      naturalWidth = 800;
      naturalHeight = 600;
      addEventListener(event: string, handler: () => void) {
        if (event === "load") queueMicrotask(handler);
      }
      removeEventListener() {}
      get src() {
        return "";
      }
      set src(_url: string) {}
    }
    vi.stubGlobal("Image", OkImage);

    const bmp = new File(["bmp-bytes"], "photo.bmp", { type: "image/bmp" });
    const result = await validateImage(bmp, []);

    expect(result).toBeInstanceOf(File);
    expect((result as File).type).toBe("image/webp");

    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });
});
