import { useCallback } from "react";
import type { Area } from "react-easy-crop";

import { MAX_IMAGE_DIMENSION_OUTPUT } from "#/const/image-const";
import { cropImageBitmap } from "#/features/catalogue/create-snack/utils/canvas-utils";

export function useImageCrop() {
  const processImage = useCallback(
    async (imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> => {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });

      console.log(pixelCrop);

      const scale = Math.min(
        1,
        MAX_IMAGE_DIMENSION_OUTPUT / Math.max(pixelCrop.width, pixelCrop.height),
      );

      const createdBlob = await cropImageBitmap(bitmap, pixelCrop, scale, "image/png");
      return new File([createdBlob], fileName, { type: "image/png", lastModified: Date.now() });
    },
    [],
  );

  return { processImage };
}
