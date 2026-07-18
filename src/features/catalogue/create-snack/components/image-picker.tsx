import { CircleAlertIcon, ImageOffIcon, X } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import { Alert, AlertAction, AlertDescription } from "#/components/ui/alert";
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

const VALIDATION_ALERT_DURATION = 4000;

type ValidationAlert = {
  id: number;
  message: string;
  error: "file-too-large" | "unsupported-file-type" | "already-added" | "resolution-too-low";
};

const errorMessageMap: Record<ValidationAlert["error"], string> = {
  "file-too-large": "Plik jest zbyt duży (maks. 10 MB).",
  "unsupported-file-type": "Nieobsługiwany typ pliku.",
  "already-added": "Ten plik został już dodany.",
  "resolution-too-low": "Zbyt niska rozdzielczość (min. 200×200 px).",
};

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
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ImageDropzone
          handleAddToQueue={handleAddToQueue}
          images={images}
          onValidationError={handleValidationError}
        >
          <AnimatePresence>
            {foundSelectedImage ? (
              <motion.img
                src={foundSelectedImage.croppedFileUrl}
                alt="Wybrany obraz"
                className="size-full object-cover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              />
            ) : (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={uploadOnClick}
                className="absolute left-0 flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg text-muted-foreground"
              >
                <ImageOffIcon />
                <p>Brak obrazu</p>
              </motion.button>
            )}
          </AnimatePresence>
        </ImageDropzone>

        <AnimatePresence>
          {foundSelectedImage && (
            <>
              <div className="absolute bottom-2 left-2 flex items-center justify-center gap-2">
                <MainImageBadges isPrimaryImage={selectedIndex === 0} />
              </div>

              <div className="absolute top-2 right-2 flex items-center justify-center gap-4">
                <MainImageToolbar handleRecrop={handleRecrop} handleDelete={handleDelete} />
              </div>
            </>
          )}
        </AnimatePresence>
      </div>

      {alerts.map((alert) => (
        <Alert variant="error" key={alert.id}>
          <CircleAlertIcon />
          <AlertDescription>{alert.message}</AlertDescription>
          <AlertAction>
            <Button size="xs" variant="ghost" onClick={() => dismissAlert(alert.id)}>
              <X className="size-4" />
            </Button>
          </AlertAction>
        </Alert>
      ))}

      <div className="flex flex-col gap-2">
        <LayoutGroup>
          <div className="grid grid-cols-3 gap-2 overflow-hidden py-0.5 ">
            <AnimatePresence mode="wait">
              {images.map((image, index) => {
                return (
                  <ImageSlot
                    key={image.id}
                    isSelected={index === selectedIndex}
                    onClick={() => setSelectedIndex(index)}
                    onMoveLeft={index > 0 ? () => handleMove(index, "left") : undefined}
                    onMoveRight={
                      index < images.length - 1 ? () => handleMove(index, "right") : undefined
                    }
                    imageSrc={image.croppedFileUrl}
                  />
                );
              })}
              {Array.from({ length: emptySpaces }).map((_, index) => {
                return <ImageSlot key={`empty-${index}`} onClick={uploadOnClick} />;
              })}
            </AnimatePresence>
          </div>
        </LayoutGroup>
      </div>

      <ImageCropDialog
        open={isCropDialogOpen}
        onCropComplete={handleCropComplete}
        onOpenChange={(open) => {
          if (!open) {
            handleCropCancel();
          }
        }}
        imageSrc={queueItemUrl}
      />
    </div>
  );
}
