import {
  MAX_IMAGE_DIMENSION,
  MAX_IMAGE_DIMENSION_OUTPUT,
  MAX_IMAGE_MEGAPIXELS,
  OPTIMIZED_QUALITY,
} from "#/const/image-const";

export async function convertToWebp(file: File): Promise<File> {
  const source = await decodeToDrawable(file);
  const sourceWidth = source.width;
  const sourceHeight = source.height;

  if (!sourceWidth || !sourceHeight) {
    throw new Error("Undecodable image");
  }

  const scale = computeDownscale(sourceWidth, sourceHeight);
  const targetWidth = Math.max(1, Math.round(sourceWidth * scale));
  const targetHeight = Math.max(1, Math.round(sourceHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  ctx.drawImage(source, 0, 0, targetWidth, targetHeight);
  closeDrawable(source);

  const blob = await canvasToWebpBlob(canvas);
  const name = replaceExtension(file.name, "webp");

  return new File([blob], name, {
    type: "image/webp",
    lastModified: Date.now(),
  });
}

type Drawable = ImageBitmap | HTMLImageElement;

function closeDrawable(source: Drawable): void {
  if (typeof ImageBitmap === "function" && source instanceof ImageBitmap) {
    source.close();
  }
}

async function decodeToDrawable(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === "function") {
    try {
      return await createImageBitmap(file, { imageOrientation: "from-image" });
    } catch {
      return await createImageBitmap(file);
    }
  }

  return await loadImageElement(file);
}

function loadImageElement(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    const handleLoad = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    const handleError = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to decode image"));
    };

    img.addEventListener("load", handleLoad, { once: true });
    img.addEventListener("error", handleError, { once: true });
    img.src = url;
  });
}

function computeDownscale(width: number, height: number): number {
  const longestSide = Math.max(width, height);
  const megapixels = (width * height) / 1_000_000;

  return Math.min(
    1,
    MAX_IMAGE_DIMENSION_OUTPUT / longestSide,
    MAX_IMAGE_DIMENSION / longestSide,
    megapixels > MAX_IMAGE_MEGAPIXELS
      ? Math.sqrt(MAX_IMAGE_MEGAPIXELS / megapixels)
      : Number.POSITIVE_INFINITY,
  );
}

function canvasToWebpBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to webp failed"));
          return;
        }
        resolve(blob);
      },
      "image/webp",
      OPTIMIZED_QUALITY / 100,
    );
  });
}

function replaceExtension(name: string, ext: string): string {
  const dot = name.lastIndexOf(".");
  const base = dot > 0 ? name.slice(0, dot) : name;
  return `${base || "image"}.${ext}`;
}
