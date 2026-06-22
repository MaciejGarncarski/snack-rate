import { useCallback, useState } from "react";
import Cropper from "react-easy-crop";

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

type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  fileName: string,
): Promise<File> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx?.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
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
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const handleCropComplete = useCallback((_: PixelCrop, cropped: PixelCrop) => {
    setCroppedAreaPixels(cropped);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels) return;
    const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, "cropped.jpg");
    onCropComplete(croppedFile);
    onOpenChange(false);
    setZoom(1);
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
        </DialogPanel>

        <DialogFooter>
          <DialogClose render={<Button variant="ghost" />}>Anuluj</DialogClose>
          <Button type="button" onClick={handleCrop}>
            Przytnij
          </Button>
        </DialogFooter>
      </DialogPopup>
    </Dialog>
  );
}
