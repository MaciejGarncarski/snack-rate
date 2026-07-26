import { useCallback } from "react";
import type { Area } from "react-easy-crop";

import { MAX_IMAGE_DIMENSION_OUTPUT } from "#/const/image-const";

const TARGET_ASPECT = 4 / 5;

export function useImageCrop() {
  const processImage = useCallback(
    async (imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> => {
      const response = await fetch(imageSrc);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob, { imageOrientation: "from-image" });

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const inputAspect = bitmap.width / bitmap.height;

      if (inputAspect < TARGET_ASPECT) {
        const outputHeight = Math.min(bitmap.height, MAX_IMAGE_DIMENSION_OUTPUT);
        const outputWidth = Math.round(outputHeight * TARGET_ASPECT);
        const drawHeight = outputHeight;
        const drawWidth = Math.round(drawHeight * inputAspect);
        const offsetX = Math.round((outputWidth - drawWidth) / 2);

        canvas.width = outputWidth;
        canvas.height = outputHeight;

        ctx.drawImage(bitmap, offsetX, 0, drawWidth, drawHeight);
      } else {
        const scale = Math.min(
          1,
          MAX_IMAGE_DIMENSION_OUTPUT / Math.max(pixelCrop.width, pixelCrop.height),
        );
        canvas.width = Math.round(pixelCrop.width * scale);
        canvas.height = Math.round(pixelCrop.height * scale);

        ctx.drawImage(
          bitmap,
          pixelCrop.x,
          pixelCrop.y,
          pixelCrop.width,
          pixelCrop.height,
          0,
          0,
          canvas.width,
          canvas.height,
        );
      }

      bitmap.close();

      return new Promise((resolve, reject) => {
        canvas.toBlob((createdBlob) => {
          if (!createdBlob) {
            reject(new Error("Canvas to blob failed"));
            return;
          }
          resolve(
            new File([createdBlob], fileName, { type: "image/png", lastModified: Date.now() }),
          );
        }, "image/png");
      });
    },
    [],
  );

  return { processImage };
}
