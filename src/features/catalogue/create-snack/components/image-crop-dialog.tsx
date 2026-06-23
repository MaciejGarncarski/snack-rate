import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "#/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "#/components/ui/dialog";
import { Field, FieldLabel } from "#/components/ui/field";
import { Slider, SliderValue } from "#/components/ui/slider";

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
        resolve(new File([blob], fileName, { type: "image/jpeg", lastModified: Date.now() }));
      },
      "image/jpeg",
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
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped.jpg");
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogPopup className="max-w-md">
        <DialogHeader>
          <DialogTitle>Przycinanie obrazu</DialogTitle>
          <DialogDescription>Przycinaj obraz do wybranego obszaru.</DialogDescription>
        </DialogHeader>
        <DialogPanel className="flex flex-col items-center gap-4">
          <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-muted">
            <Cropper
              key={imageSrc}
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="rect"
              showGrid
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={handleCropComplete}
            />
          </div>

          <Field>
            <Slider
              value={zoom}
              onValueChange={(value) => {
                if (typeof value === "number") {
                  setZoom(value);
                }
              }}
              min={1}
              max={3}
              step={0.1}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <FieldLabel className="text-sm font-medium">Przybliżenie</FieldLabel>
                <SliderValue />
              </div>
            </Slider>
          </Field>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </DialogPanel>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" disabled={isCropping} />}>
            Anuluj
          </DialogClose>
          <Button type="button" onClick={handleCrop} disabled={!croppedAreaPixels || isCropping}>
            {isCropping ? "Przycinanie..." : "Przytnij"}
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
