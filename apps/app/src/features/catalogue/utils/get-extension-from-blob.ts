const extensionByMimeType = new Map<string, string>([
  ["image/jpeg", "jpg"],
  ["image/jpg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
]);

export function getExtensionFromBlob(blob: Blob): string {
  const mime = blob.type;

  return extensionByMimeType.get(mime) || mime.split("/")[1] || "";
}
