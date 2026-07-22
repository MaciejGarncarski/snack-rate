import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE, MAXIMUM_IMAGES } from "@/const/image-const";

export type ImageValidationError =
  | "file-too-large"
  | "unsupported-file-type"
  | "already-added"
  | "resolution-too-low"
  | "maximum-images-reached";
type ImageValidationResult = File | ImageValidationError;

async function hashFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function isDuplicate(newFile: File, existing: File[]): Promise<boolean> {
  const newHash = await hashFile(newFile);
  for (const f of existing) {
    const existingHash = await hashFile(f);
    if (newHash === existingHash) {
      return true;
    }
  }
  return false;
}

export async function validateImage(file: File, allFiles: File[]): Promise<ImageValidationResult> {
  if (await isDuplicate(file, allFiles)) {
    return "already-added";
  }

  if (allFiles.length >= MAXIMUM_IMAGES) {
    return "maximum-images-reached";
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
