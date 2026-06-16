import { ImgUrl } from "#/features/snacks/server/value-objects/img-url.vo";

describe("ImgUrl value object", () => {
  describe("create", () => {
    it("should create a valid http URL", () => {
      const url = ImgUrl.create("http://example.com/image.jpg");

      expect(url.toString()).toBe("http://example.com/image.jpg");
    });

    it("should create a valid https URL", () => {
      const url = ImgUrl.create("https://example.com/image.jpg");

      expect(url.toString()).toBe("https://example.com/image.jpg");
    });

    it("should create a URL with a path and query string", () => {
      const url = ImgUrl.create("https://cdn.example.com/images/photo.jpg?v=1&size=lg");

      expect(url.toString()).toBe("https://cdn.example.com/images/photo.jpg?v=1&size=lg");
    });

    it("should throw when value is empty string", () => {
      expect(() => ImgUrl.create("")).toThrow("URL cannot be empty");
    });

    it("should throw when value has no protocol", () => {
      expect(() => ImgUrl.create("example.com/image.jpg")).toThrow("Invalid URL format");
    });

    it("should throw when value uses an unsupported protocol", () => {
      expect(() => ImgUrl.create("ftp://example.com/image.jpg")).toThrow("Invalid URL format");
    });

    it("should throw when value is only the protocol", () => {
      expect(() => ImgUrl.create("https://")).toThrow("Invalid URL format");
    });
  });

  describe("toString", () => {
    it("should return the original URL string", () => {
      const raw = "https://example.com/image.jpg";
      const url = ImgUrl.create(raw);

      expect(url.toString()).toBe(raw);
    });
  });
});
