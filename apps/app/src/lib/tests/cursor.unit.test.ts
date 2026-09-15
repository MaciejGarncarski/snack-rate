import { decodeCursor, encodeCursor, slicePage } from "#/lib/cursor";

function testItem(id: string, createdAt: string) {
  return { id, createdAt: new Date(createdAt) };
}

describe("cursor", () => {
  describe("encode/decode roundtrip", () => {
    it("should roundtrip createdAt and id", () => {
      const createdAt = new Date("2026-01-02T10:00:00.000Z");

      const decoded = decodeCursor(encodeCursor(createdAt, "comment-1"));

      expect(decoded).toEqual({ createdAt, id: "comment-1", aggregateValue: undefined });
    });

    it("should roundtrip an aggregate value", () => {
      const createdAt = new Date("2026-01-02T10:00:00.000Z");

      const decoded = decodeCursor(encodeCursor(createdAt, "comment-1", 4.5));

      expect(decoded).toEqual({ createdAt, id: "comment-1", aggregateValue: 4.5 });
    });

    it("should return null for garbage input", () => {
      expect(decodeCursor("not-a-cursor")).toBeNull();
      expect(decodeCursor("")).toBeNull();
    });

    it("should return null for a well-formed base64 payload with a wrong shape", () => {
      const wrongShape = Buffer.from(JSON.stringify({ foo: "bar" })).toString("base64url");

      expect(decodeCursor(wrongShape)).toBeNull();
    });
  });

  describe("slicePage", () => {
    it("should return empty items and null cursor for an empty page", () => {
      expect(slicePage([], 5)).toEqual({ items: [], nextCursor: null });
    });

    it("should return null cursor when items fit exactly in the limit", () => {
      const items = [
        testItem("b", "2026-01-02T00:00:00.000Z"),
        testItem("a", "2026-01-01T00:00:00.000Z"),
      ];

      const page = slicePage(items, 2);

      expect(page.items).toEqual(items);
      expect(page.nextCursor).toBeNull();
    });

    it("should cut the overflow item and point the cursor at the last returned item", () => {
      const items = [
        testItem("c", "2026-01-03T00:00:00.000Z"),
        testItem("b", "2026-01-02T00:00:00.000Z"),
        testItem("a", "2026-01-01T00:00:00.000Z"),
      ];

      const page = slicePage(items, 2);

      expect(page.items.map((entry) => entry.id)).toEqual(["c", "b"]);
      expect(page.nextCursor).not.toBeNull();

      // oxlint-disable-next-line vitest/no-conditional-in-test -- overflow guarantees a cursor here
      const decoded = decodeCursor(page.nextCursor ?? "");
      expect(decoded).toEqual({
        createdAt: new Date("2026-01-02T00:00:00.000Z"),
        id: "b",
        aggregateValue: undefined,
      });
    });
  });
});
