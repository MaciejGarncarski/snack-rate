import { OUTPUT_ASPECT_RATIO } from "#/const/image-const";

export async function normalizeImageAspectRatio(file: File): Promise<File> {
  const img = await loadImage(file);

  const aspect = img.naturalWidth / img.naturalHeight;

  if (aspect >= OUTPUT_ASPECT_RATIO) {
    return file;
  }

  const targetWidth = Math.round(img.naturalHeight * OUTPUT_ASPECT_RATIO);
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const offsetX = Math.round((targetWidth - img.naturalWidth) / 2);
  ctx.drawImage(img, offsetX, 0);

  return canvasToFile(canvas, file);
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    const handleLoad = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    const handleError = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };

    img.addEventListener("load", handleLoad, { once: true });
    img.addEventListener("error", handleError, { once: true });
    img.src = url;
  });
}

async function canvasToFile(canvas: HTMLCanvasElement, sourceFile: File): Promise<File> {
  const createdBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas to blob failed"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });

  return new File([createdBlob], sourceFile.name, {
    type: "image/png",
    lastModified: sourceFile.lastModified,
  });
}
