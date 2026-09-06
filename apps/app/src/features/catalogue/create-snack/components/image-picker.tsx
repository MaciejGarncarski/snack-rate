import { AlertCircleIcon, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "#/components/ui/alert";
import { Button } from "#/components/ui/button";
import { MAXIMUM_IMAGES } from "#/const/image-const";
import { ImageCropDialog } from "#/features/catalogue/create-snack/components/image-crop-dialog";
import { ImageDropzone } from "#/features/catalogue/create-snack/components/image-dropzone";
import { ImageSlot } from "#/features/catalogue/create-snack/components/image-slot";
import { MainImageBadges } from "#/features/catalogue/create-snack/components/main-image-badges";
import { MainImageToolbar } from "#/features/catalogue/create-snack/components/main-image-toolbar";
import { useAddImage, type ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";
import { useCropQueue } from "#/features/catalogue/create-snack/hooks/use-crop-queue";
import { useObjectUrl } from "#/features/catalogue/create-snack/hooks/use-object-url";
import { useReorder } from "#/features/catalogue/create-snack/hooks/use-reorder";
import type { ImageValidationError } from "#/features/catalogue/create-snack/utils/validate-image";

const VALIDATION_ALERT_DURATION = 6000;

type ValidationAlert = {
  id: number;
  message: string;
  error: ImageValidationError;
};

const errorMessageMap = {
  "file-too-large": "Plik jest zbyt duży (maks. 10 MB).",
  "unsupported-file-type": "Nieobsługiwany typ pliku.",
  "already-added": "Ten plik został już dodany.",
  "resolution-too-low": "Zbyt niska rozdzielczość (min. 200×200 px).",
  "maximum-images-reached": "Osiągnięto maksimum obrazów.",
} satisfies Record<ValidationAlert["error"], string>;

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
};

export function ImagePicker({ onChange }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<ImagePair[]>([]);
  const [alerts, setAlerts] = useState<ValidationAlert[]>([]);
  const alertIdRef = useRef(0);
  const foundSelectedImage = images[selectedIndex] || null;

  const {
    currentQueueItem,
    handleAddToQueue,
    handleCropCancel,
    handleCropComplete,
    handleRecrop,
    isCropDialogOpen,
  } = useCropQueue({ foundSelectedImage, setImages, onChange });

  const { handleMove } = useReorder({
    images,
    setImages,
    onChange,
  });

  const handleValidationError = useCallback((error: ValidationAlert["error"]) => {
    const id = ++alertIdRef.current;
    setAlerts((prev) => [...prev, { id, message: errorMessageMap[error], error }]);

    setTimeout(() => {
      setAlerts((prev) => prev.filter((a) => a.id !== id));
    }, VALIDATION_ALERT_DURATION);
  }, []);

  const dismissAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const { uploadOnClick } = useAddImage({
    onAddToQueue: handleAddToQueue,
    onValidationError: handleValidationError,
    allFiles: images.map((img) => img.file),
  });

  const queueItemUrl = useObjectUrl(currentQueueItem?.file);

  const handleDelete = useCallback(() => {
    if (!foundSelectedImage) return;

    setImages((prevImages) => {
      const newImages = prevImages.filter((img) => img.id !== foundSelectedImage.id);
      onChange(newImages.map((img) => img.croppedFile || img.file));
      return newImages;
    });
    setSelectedIndex(0);
  }, [foundSelectedImage, onChange]);

  const emptySpaces = MAXIMUM_IMAGES - images.length;

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="mx-auto w-full max-w-85">
        <div className="relative">
          <div className="absolute -top-2 left-1/2 h-5 w-16 -translate-x-1/2 -rotate-2 bg-primary/15 shadow-sm ring-1 ring-primary/10 backdrop-blur-sm" />
        </div>

        <div className="rounded-2xl bg-card p-2.5 pb-0 shadow-lg ring-1 ring-border rotate-[0.6deg]">
          <div className="relative aspect-4/5 overflow-hidden rounded-xl bg-muted">
            <ImageDropzone
              handleAddToQueue={handleAddToQueue}
              images={images}
              onValidationError={handleValidationError}
              selectedImage={foundSelectedImage}
              onUploadClick={uploadOnClick}
            />
          </div>

          <div className="flex min-h-13 items-center justify-between gap-2 px-1 py-3">
            <div className="min-w-0 flex-1">
              {foundSelectedImage ? (
                <MainImageBadges isPrimaryImage={selectedIndex === 0} />
              ) : (
                <span className="text-xs tracking-wide text-muted-foreground">Brak zdjęcia</span>
              )}
            </div>

            <AnimatePresence>
              {foundSelectedImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                >
                  <MainImageToolbar handleRecrop={handleRecrop} handleDelete={handleDelete} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mx-auto mt-2 h-2 w-[85%] rounded-full bg-foreground/5 blur-[6px]" />
      </div>

      {alerts.length > 0 && (
        <div className="flex flex-col gap-2">
          {alerts.map((alert) => (
            <Alert
              variant="destructive"
              key={alert.id}
              className="rounded-2xl border-destructive/20 bg-destructive/5 py-3"
            >
              <AlertCircleIcon className="size-4" />
              <AlertTitle className="text-xs font-medium">Nie dodano obrazu</AlertTitle>
              <AlertDescription className="text-xs">{alert.message}</AlertDescription>
              <AlertAction>
                <Button
                  size="icon-xs"
                  variant="ghost"
                  onClick={() => dismissAlert(alert.id)}
                  className="rounded-full"
                >
                  <X className="size-3.5" />
                </Button>
              </AlertAction>
            </Alert>
          ))}
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 sm:p-4">
        <LayoutGroup>
          <div className="flex justify-center gap-2 sm:gap-3">
            <AnimatePresence mode="popLayout">
              {images.map((image, index) => (
                <ImageSlot
                  key={image.id}
                  isSelected={index === selectedIndex}
                  onClick={() => setSelectedIndex(index)}
                  onMoveLeft={index > 0 ? () => handleMove(index, "left") : undefined}
                  onMoveRight={
                    index < images.length - 1 ? () => handleMove(index, "right") : undefined
                  }
                  imageSrc={image.croppedFileUrl}
                  index={index}
                />
              ))}
            </AnimatePresence>
            {Array.from({ length: emptySpaces }).map((_, idx) => (
              <ImageSlot
                key={`empty-${idx}`}
                onClick={uploadOnClick}
                index={(images.length + idx) as number}
              />
            ))}
          </div>
        </LayoutGroup>

        <p className="mt-3 text-center text-xs font-medium tracking-wide text-muted-foreground">
          {images.length === 0
            ? "Dodaj do 3 zdjęć · pierwsze to okładka"
            : `${images.length} / ${MAXIMUM_IMAGES} · ${selectedIndex === 0 ? "okładka" : `zdjęcie ${selectedIndex + 1}`}`}
        </p>
      </div>

      <ImageCropDialog
        open={isCropDialogOpen}
        onCropComplete={handleCropComplete}
        onOpenChange={(open) => {
          if (!open) handleCropCancel();
        }}
        imageSrc={queueItemUrl}
      />
    </div>
  );
}
