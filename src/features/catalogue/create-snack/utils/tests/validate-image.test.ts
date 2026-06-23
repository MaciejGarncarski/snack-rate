import { MAX_FILE_SIZE } from "#/features/catalogue/create-snack/consts/image-const";
import { validateImage } from "#/features/catalogue/create-snack/utils/validate-image";

describe("validateImage", () => {
  describe("filesize", () => {
    it("should return 'file-too-large' if the file size exceeds MAX_FILE_SIZE", () => {
      const largeFile = new File(["a".repeat(MAX_FILE_SIZE + 1)], "large.png", {
        type: "image/png",
      });

      const result = validateImage(largeFile, []);
      expect(result).toBe("file-too-large");
    });

    it("should return the file if the size is within limits", () => {
      const validFile = new File(["a".repeat(MAX_FILE_SIZE)], "valid.png", {
        type: "image/png",
      });

      const result = validateImage(validFile, []);
      expect(result).toBe(validFile);
    });
  });

  describe("file type", () => {
    it("should return 'unsupported-file-type' if the file is not an image", () => {
      const unsupportedFile = new File(["content"], "file.txt", {
        type: "text/plain",
      });

      const result = validateImage(unsupportedFile, []);
      expect(result).toBe("unsupported-file-type");
    });

    it("should return 'unsupported-file-type' if the image format is not supported", () => {
      const unsupportedFormat = new File(["content"], "image.bmp", {
        type: "image/bmp",
      });

      const result = validateImage(unsupportedFormat, []);
      expect(result).toBe("unsupported-file-type");
    });

    it("should return the file if the type is supported", () => {
      const supportedFile = new File(["content"], "image.png", {
        type: "image/png",
      });

      const result = validateImage(supportedFile, []);
      expect(result).toBe(supportedFile);
    });
  });

  describe("duplicate files", () => {
    it("should return 'already-added' if the file is a duplicate", () => {
      const file = new File(["content"], "image.png", {
        type: "image/png",
      });
      const allFiles = [file];

      const result = validateImage(file, allFiles);
      expect(result).toBe("already-added");
    });

    it("should return the file if it has the same name but different size", () => {
      const existing = new File(["short"], "image.png", {
        type: "image/png",
      });
      const newFile = new File(["a much longer content"], "image.png", {
        type: "image/png",
      });

      const result = validateImage(newFile, [existing]);
      expect(result).toBe(newFile);
    });

    it("should return the file if it has the same size but different name", () => {
      const existing = new File(["content"], "first.png", {
        type: "image/png",
      });
      const newFile = new File(["content"], "second.png", {
        type: "image/png",
      });

      const result = validateImage(newFile, [existing]);
      expect(result).toBe(newFile);
    });

    it("should return the file if it is not a duplicate", () => {
      const file = new File(["content"], "image.png", {
        type: "image/png",
      });

      const result = validateImage(file, []);
      expect(result).toBe(file);
    });
  });
});
