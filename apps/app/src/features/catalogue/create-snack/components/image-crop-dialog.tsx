import { useCallback, useState } from "react";
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
import { useImageCrop } from "#/features/catalogue/create-snack/hooks/use-image-crop";

type ImageCropDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
};

const MAX_ZOOM = 3;
const MIN_ZOOM = 0.8;

export function ImageCropDialog({
  open,
  onOpenChange,
  imageSrc,
  onCropComplete,
}: ImageCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [croppedAreaPercent, setCroppedAreaPercent] = useState<Area | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { processImage } = useImageCrop();

  const handleCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPercent(croppedArea);
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleCrop = async () => {
    if (!croppedAreaPixels || !croppedAreaPercent) return;
    setIsCropping(true);
    setError(null);
    try {
      const croppedFile = await processImage(imageSrc, croppedAreaPercent, "cropped.png");
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
        <div className="relative aspect-4/5 w-full shadow bg-gradient-transparency">
          <Cropper
            key={imageSrc}
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 5}
            cropShape="rect"
            showGrid
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
