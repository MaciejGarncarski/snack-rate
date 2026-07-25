import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "#/components/ui/dialog";
import { Field } from "#/components/ui/field";
import { Label } from "#/components/ui/label";
import { Slider } from "#/components/ui/slider";

const MAX_OUTPUT_DIMENSION = 1024;

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area, fileName: string): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Could not get canvas context");
  }

  const scale = Math.min(1, MAX_OUTPUT_DIMENSION / Math.max(pixelCrop.width, pixelCrop.height));
  canvas.width = pixelCrop.width * scale;
  canvas.height = pixelCrop.height * scale;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Canvas to blob failed"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/png", lastModified: Date.now() }));
      },
      "image/png",
      0.95,
    );
  });
}

type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
};

const MAX_ZOOM = 3;
const MIN_ZOOM = 1;

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setError(null);
    }
  }, [open, imageSrc]);

  const handleCropComplete = useCallback((_: Area, cropped: Area) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    setIsCropping(true);
    setError(null);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped.png");
      onCropComplete(croppedFile);
      onOpenChange(false);
    } catch (err) {
      setError("Nie udało się przyciąć obrazu. Spróbuj ponownie.");
      // oxlint-disable-next-line no-console
      console.error("Crop failed", err);
    } finally {
      setIsCropping(false);
    }
  };

  return (
    <Dialog isOpen={open} onOpenChange={onOpenChange} className="max-w-md">
      <DialogHeader>
        <DialogTitle>Przycinanie obrazu</DialogTitle>
        <DialogDescription>Przycinaj obraz do wybranego obszaru.</DialogDescription>
      </DialogHeader>
      <div className="flex flex-col items-center gap-4">
        <div className="relative aspect-4/5 w-full overflow-hidden rounded-xl bg-muted">
          <Cropper
            key={imageSrc}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 5}
            cropShape="rect"
            showGrid
            objectFit="vertical-cover"
            minZoom={MIN_ZOOM}
            maxZoom={MAX_ZOOM}
            restrictPosition={true}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <Field>
          <div className="flex items-center gap-6 py-4 h-auto">
            <Label id="zoom-label" htmlFor="zoom" className="shrink-0">
              Przybliżenie
            </Label>
            <Slider
              id="zoom"
              aria-label="Przybliżenie"
              value={zoom}
              onChange={(value) => {
                if (typeof value === "number") {
                  setZoom(value);
                }
              }}
              minValue={MIN_ZOOM}
              maxValue={MAX_ZOOM}
              step={0.1}
              className="flex flex-col h-2 grow-0"
            />
          </div>
        </Field>

        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>

      <DialogFooter>
        <DialogClose variant="ghost" isDisabled={isCropping}>
          Anuluj
        </DialogClose>
        <Button type="button" onPress={handleCrop} isDisabled={!croppedAreaPixels || isCropping}>
          {isCropping ? "Przycinanie..." : "Przytnij"}
        </Button>
      </DialogFooter>
    </Dialog>
  );
}
