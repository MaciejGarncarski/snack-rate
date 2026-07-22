import { useEffect } from "react";

import { ALLOWED_MIME_TYPES, MAXIMUM_IMAGES } from "@/const/image-const";
import { validateImage } from "@/features/catalogue/create-snack/utils/validate-image";
import type { ImageValidationError } from "@/features/catalogue/create-snack/utils/validate-image";

export type ImagePair = {
  id: string;
  file: File;
  croppedFileUrl?: string;
  croppedFile?: File;
};

type UseAddImageProps = {
  onAddToQueue: (file: File) => void;
  onValidationError: (error: ImageValidationError) => void;
  allFiles: File[];
};

export function useAddImage({ onAddToQueue, onValidationError, allFiles }: UseAddImageProps) {
  useEffect(() => {
    const handlePaste = async (event: ClipboardEvent) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const imageItem = Array.from(items).find((item) => item.type.startsWith("image/"));
      if (!imageItem) return;

      const file = imageItem.getAsFile();
      if (!file) return;

      const validationResult = await validateImage(file, allFiles);

      if (validationResult instanceof File) {
        onAddToQueue(validationResult);
        return;
      }
      onValidationError(validationResult);
    };

    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [onAddToQueue, allFiles, onValidationError]);

  const uploadOnClick = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = Array.from(ALLOWED_MIME_TYPES).join(",");
    input.multiple = allFiles.length < MAXIMUM_IMAGES;
    input.click();

    input.addEventListener("change", async (event) => {
      const target = event.target as HTMLInputElement;

      if (!target.files) return;

      const newFiles = Array.from(target.files);

      for (const file of newFiles) {
        const validationResult = await validateImage(file, allFiles);

        console.log("isValidated", validationResult instanceof File);

        if (validationResult instanceof File) {
          onAddToQueue(validationResult);
          continue;
        }

        onValidationError(validationResult);
      }
    });
  };

  return {
    uploadOnClick,
  };
}
