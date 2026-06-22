import {
  MAX_FILE_SIZE,
  SUPPORTED_FORMATS,
} from "#/features/catalogue/create-snack/consts/image-const";
import { addUnsupportedFileToast } from "#/features/catalogue/create-snack/utils/add-unsupported-file-toast";
import { addAlreadyAddedToast } from "#/features/catalogue/create-snack/utils/already-added-toast";

type ImageValidationError = "file-too-large" | "unsupported-file-type" | "already-added";
type ImageValidationResult = File | ImageValidationError;

const isDuplicate = (newFile: File, existing: File[]) => {
  return existing.some((f) => f.name === newFile.name && f.size === newFile.size);
};

export function validateImage(file: File, allFiles: File[]): ImageValidationResult {
  if (isDuplicate(file, allFiles)) {
    return "already-added";
  }

  if (file.size > MAX_FILE_SIZE) {
    return "file-too-large";
  }

  if (!file.type.startsWith("image/")) {
    return "unsupported-file-type";
  }

  if (!SUPPORTED_FORMATS.includes(file.type)) {
    return "unsupported-file-type";
  }

  return file;
}

export function showToastForValidationError(error: ImageValidationError, fileName: string) {
  switch (error) {
    case "file-too-large":
      addUnsupportedFileToast();
      break;
    case "unsupported-file-type":
      addUnsupportedFileToast();
      break;
    case "already-added":
      addAlreadyAddedToast({ fileName });
      break;
  }
}
