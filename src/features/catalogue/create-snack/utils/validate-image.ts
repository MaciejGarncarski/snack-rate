import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "#/const/image-const";

export type ImageValidationError =
  | "file-too-large"
  | "unsupported-file-type"
  | "already-added"
  | "resolution-too-low";
type ImageValidationResult = File | ImageValidationError;

const isDuplicate = (newFile: File, existing: File[]) => {
  return existing.some((f) => f.name === newFile.name && f.size === newFile.size);
};

export async function validateImage(file: File, allFiles: File[]): Promise<ImageValidationResult> {
  if (isDuplicate(file, allFiles)) {
    return "already-added";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "file-too-large";
  }

  if (!file.type.startsWith("image/")) {
    return "unsupported-file-type";
  }

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "unsupported-file-type";
  }

  try {
    const isResolutionValid = await checkImageResolution(file);

    if (!isResolutionValid) {
      return "resolution-too-low";
    }
  } catch {
    return "resolution-too-low";
  }

  return file;
}

const MIN_WIDTH = 200;
const MIN_HEIGHT = 200;

function checkImageResolution(file: File): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    const handleLoad = () => {
      const isValid = img.naturalWidth >= MIN_WIDTH && img.naturalHeight >= MIN_HEIGHT;

      URL.revokeObjectURL(url);
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);

      resolve(isValid);
    };

    const handleError = () => {
      URL.revokeObjectURL(url);
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);

      reject(new Error("Failed to load image"));
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);

    img.src = url;
  });
}
