import { CropIcon, ImageOffIcon, TrashIcon } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useState } from "react";

import { Badge } from "#/components/ui/badge";
import { Button } from "#/components/ui/button";
import { ImageCropDialog } from "#/features/catalogue/create-snack/components/image-crop-dialog";
import { ImageSlot } from "#/features/catalogue/create-snack/components/image-slot";
import { ImageSlotEmpty } from "#/features/catalogue/create-snack/components/image-slot-empty";
import { useAddImage, type ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";
import { useCropQueue } from "#/features/catalogue/create-snack/hooks/use-crop-queue";
import { useObjectUrl } from "#/features/catalogue/create-snack/hooks/use-object-url";

const MotionBadge = motion.create(Badge);

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
  totalImages?: number;
};

export function ImagePicker({ onChange, totalImages = 3 }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [images, setImages] = useState<ImagePair[]>([]);
  const foundSelectedImage = images[selectedIndex] || null;

  const {
    currentQueueItem,
    handleAddToQueue,
    handleCropCancel,
    handleCropComplete,
    handleRecrop,
    isCropDialogOpen,
  } = useCropQueue({ foundSelectedImage, images, setImages, onChange });

  const { uploadOnClick } = useAddImage({
    onAddToQueue: handleAddToQueue,
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

  const emptySpaces = totalImages - images.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <div className="flex size-94 items-center justify-center overflow-hidden rounded-lg border border-accent bg-secondary">
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
                className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-lg text-muted-foreground ring-accent focus:ring-2 focus:outline-none"
              >
                <ImageOffIcon />
                <p>Brak obrazu</p>
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {foundSelectedImage && (
            <>
              <div className="absolute bottom-2 left-2 flex items-center justify-center gap-2">
                <MotionBadge>Podgląd</MotionBadge>
                {selectedIndex === 0 && (
                  <MotionBadge
                    initial={{ y: 15 }}
                    animate={{ y: 0 }}
                    exit={{ y: 15 }}
                    variant="info"
                    className="backdrop-blur-3xl"
                  >
                    Główne zdjęcie
                  </MotionBadge>
                )}
              </div>

              <div className="absolute top-2 right-2 flex items-center justify-center gap-4">
                <Button size="icon" variant="default" onClick={handleRecrop}>
                  <CropIcon />
                </Button>
                <Button size="icon" variant="destructive" onClick={handleDelete}>
                  <TrashIcon />
                </Button>
              </div>
            </>
          )}
        </AnimatePresence>
      </div>
      <LayoutGroup>
        <div className="flex gap-2">
          {images.map((image, index) => {
            return (
              <ImageSlot
                key={image.id}
                isSelected={index === selectedIndex}
                onClick={() => setSelectedIndex(index)}
                imageSrc={image.croppedFileUrl}
              />
            );
          })}
          {Array.from({ length: emptySpaces }).map((_, index) => {
            return <ImageSlotEmpty key={index} onClick={uploadOnClick} />;
          })}
        </div>
      </LayoutGroup>

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
