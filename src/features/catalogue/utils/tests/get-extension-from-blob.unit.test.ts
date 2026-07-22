import { getExtensionFromBlob } from "@/features/catalogue/utils/get-extension-from-blob.ts";

describe("getExtensionFromBlob", () => {
  it("should return the correct file ending for a given Blob", () => {
    const blob = new Blob([""], { type: "image/png" });
    const result = getExtensionFromBlob(blob);
    expect(result).toBe("png");
  });

  it("should not return the file ending for an unknown Blob type", () => {
    const blob = new Blob([""], { type: "application/unknown" });
    const result = getExtensionFromBlob(blob);
    expect(result).toBe("unknown");
  });

  it("should return an empty string for a Blob with no type", () => {
    const blob = new Blob([""]);
    const result = getExtensionFromBlob(blob);
    expect(result).toBe("");
  });
});
