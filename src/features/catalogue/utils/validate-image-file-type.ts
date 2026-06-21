export const acceptedImageTypes = ["image/jpeg", "image/png", "image/avif", "image/webp"];
export type AcceptedImageType = (typeof acceptedImageTypes)[number];

export function validateImageFileType(file: File): boolean {
  return acceptedImageTypes.includes(file.type);
}
