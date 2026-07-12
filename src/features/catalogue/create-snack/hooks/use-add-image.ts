import { useEffect } from "react";

import {
  ALLOWED_MIME_TYPES,
  MAXIMUM_IMAGES,
} from "#/features/catalogue/create-snack/consts/image-const";
import {
  showToastForValidationError,
  validateImage,
} from "#/features/catalogue/create-snack/utils/validate-image";

export type ImagePair = {
  id: string;
  file: File;
  croppedFileUrl?: string;
  croppedFile?: File;
};

type UseAddImageProps = {
  onAddToQueue: (file: File) => void;
  allFiles: File[];
};

export function useAddImage({ onAddToQueue, allFiles }: UseAddImageProps) {
  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      const validationResult = validateImage(file, allFiles);

      if (validationResult instanceof File) {
        onAddToQueue(validationResult);
        return;
      }
      showToastForValidationError(validationResult, file.name);
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onAddToQueue, allFiles]);

  const uploadOnClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = Array.from(ALLOWED_MIME_TYPES).join(",");
    input.multiple = allFiles.length < MAXIMUM_IMAGES;
    input.click();

    input.addEventListener("change", (event) => {
      const target = event.target as HTMLInputElement;

      if (!target.files) return;

      const newFiles = Array.from(target.files);

      newFiles.forEach((newFile, index) => {
        const validationResult = validateImage(newFile, allFiles);

        if (validationResult instanceof File) {
          if (allFiles.length + index >= MAXIMUM_IMAGES) {
            return;
          }

          onAddToQueue(validationResult);
          return;
        }

        showToastForValidationError(validationResult, newFile.name);
      });
    });
  };

  return {
    uploadOnClick,
  };
}
