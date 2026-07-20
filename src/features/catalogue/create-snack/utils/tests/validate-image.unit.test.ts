import { MAX_FILE_SIZE } from "#/const/image-const";
import { validateImage } from "#/features/catalogue/create-snack/utils/validate-image";

const mockImageDimensions = { width: 200, height: 200 };

beforeEach(() => {
  mockImageDimensions.width = 200;
  mockImageDimensions.height = 200;
});

beforeAll(() => {
  class MockImage {
    naturalWidth = mockImageDimensions.width;
    naturalHeight = mockImageDimensions.height;

    set src(_url: string) {
      queueMicrotask(() => {
        this.onload?.();
      });
    }

    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    addEventListener(event: string, handler: () => void) {
      if (event === "load") this.onload = handler;
      if (event === "error") this.onerror = handler;
    }

    removeEventListener() {}
  }

  globalThis.Image = MockImage as unknown as typeof Image;
});

describe("validateImage", () => {
  describe("filesize", () => {
    it("should return 'file-too-large' if the file size exceeds MAX_FILE_SIZE", async () => {
      const largeFile = new File(["a".repeat(MAX_FILE_SIZE + 1)], "large.png", {
        type: "image/png",
      });

      const result = await validateImage(largeFile, []);
      expect(result).toBe("file-too-large");
    });

    it("should return the file if the size is within limits", async () => {
      const validFile = new File(["a".repeat(MAX_FILE_SIZE)], "valid.png", {
        type: "image/png",
      });

      const result = await validateImage(validFile, []);
      expect(result).toBe(validFile);
    });
  });

  describe("file type", () => {
    it("should return 'unsupported-file-type' if the file is not an image", async () => {
      const unsupportedFile = new File(["content"], "file.txt", {
        type: "text/plain",
      });

      const result = await validateImage(unsupportedFile, []);
      expect(result).toBe("unsupported-file-type");
    });

    it("should return 'unsupported-file-type' if the image format is not supported", async () => {
      const unsupportedFormat = new File(["content"], "image.bmp", {
        type: "image/bmp",
      });

      const result = await validateImage(unsupportedFormat, []);
      expect(result).toBe("unsupported-file-type");
    });

    it("should return the file if the type is supported", async () => {
      const supportedFile = new File(["content"], "image.png", {
        type: "image/png",
      });

      const result = await validateImage(supportedFile, []);
      expect(result).toBe(supportedFile);
    });
  });

  describe("resolution", () => {
    it("should return 'resolution-too-low' if the image is smaller than the minimum dimensions", async () => {
      mockImageDimensions.width = 50;
      mockImageDimensions.height = 50;

      const file = new File(["content"], "small.png", {
        type: "image/png",
      });

      const result = await validateImage(file, []);

      expect(result).toBe("resolution-too-low");
    });

    it("should return the file if the image meets minimum dimensions", async () => {
      mockImageDimensions.width = 200;
      mockImageDimensions.height = 200;

      const file = new File(["content"], "valid-size.png", {
        type: "image/png",
      });

      const result = await validateImage(file, []);

      expect(result).toBe(file);
    });
  });

  describe("duplicate files", () => {
    it("should return 'already-added' if the file has the same content", async () => {
      const file = new File(["content"], "image.png", {
        type: "image/png",
      });
      const allFiles = [file];

      const result = await validateImage(file, allFiles);
      expect(result).toBe("already-added");
    });

    it("should return the file if it has the same name but different content", async () => {
      const existing = new File(["short"], "image.png", {
        type: "image/png",
      });
      const newFile = new File(["a much longer content"], "image.png", {
        type: "image/png",
      });

      const result = await validateImage(newFile, [existing]);
      expect(result).toBe(newFile);
    });

    it("should return the file if it has the same size but different content", async () => {
      const existing = new File(["content"], "first.png", {
        type: "image/png",
      });
      const newFile = new File(["different"], "second.png", {
        type: "image/png",
      });

      const result = await validateImage(newFile, [existing]);
      expect(result).toBe(newFile);
    });

    it("should return 'already-added' if files have different names but same content", async () => {
      const existing = new File(["same content"], "first.png", {
        type: "image/png",
      });
      const newFile = new File(["same content"], "second.png", {
        type: "image/png",
      });

      const result = await validateImage(newFile, [existing]);
      expect(result).toBe("already-added");
    });

    it("should return the file if it is not a duplicate", async () => {
      const file = new File(["content"], "image.png", {
        type: "image/png",
      });

      const result = await validateImage(file, []);
      expect(result).toBe(file);
    });
  });
});
