import type { Area } from "react-easy-crop";

export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to blob failed"));
          return;
        }
        resolve(blob);
      },
      type,
      quality,
    );
  });
}

export function cropImageBitmap(
  bitmap: ImageBitmap,
  pixelCrop: Area,
  scale: number,
  outputType: string,
  quality?: number,
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

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

  bitmap.close();
  return canvasToBlob(canvas, outputType, quality);
}
