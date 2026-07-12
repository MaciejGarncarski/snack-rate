import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from "#/const/image-const";
import { addFilesizeToast } from "#/features/catalogue/create-snack/utils/add-filesize-toast";
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

  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return "unsupported-file-type";
  }

  return file;
}

export function showToastForValidationError(error: ImageValidationError, fileName: string) {
  switch (error) {
    case "file-too-large":
      addFilesizeToast();
      break;
    case "unsupported-file-type":
      addUnsupportedFileToast();
      break;
    case "already-added":
      addAlreadyAddedToast({ fileName });
      break;
  }
}
