import { ImageOffIcon } from "lucide-react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useState } from "react";

import { ImageCropDialog } from "#/features/catalogue/create-snack/components/image-crop-dialog";
import { ImageDropzone } from "#/features/catalogue/create-snack/components/image-dropzone";
import { ImageSlot } from "#/features/catalogue/create-snack/components/image-slot";
import { ImageSlotEmpty } from "#/features/catalogue/create-snack/components/image-slot-empty";
import { MainImageBadges } from "#/features/catalogue/create-snack/components/main-image-badges";
import { MainImageToolbar } from "#/features/catalogue/create-snack/components/main-image-toolbar";
import { MAXIMUM_IMAGES } from "#/features/catalogue/create-snack/consts/image-const";
import { useAddImage, type ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";
import { useCropQueue } from "#/features/catalogue/create-snack/hooks/use-crop-queue";
import { useObjectUrl } from "#/features/catalogue/create-snack/hooks/use-object-url";
import { useReorder } from "#/features/catalogue/create-snack/hooks/use-reorder";

type Props = {
  value: File[];
  onChange: (files: File[]) => void;
};

export function ImagePicker({ onChange }: Props) {
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
  } = useCropQueue({ foundSelectedImage, setImages, onChange });

  const { handleMove } = useReorder({
    images,
    setImages,
    setSelectedIndex,
    onChange,
  });

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

  const emptySpaces = MAXIMUM_IMAGES - images.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative">
        <ImageDropzone handleAddToQueue={handleAddToQueue} images={images}>
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
                className="absolute left-0 flex h-full w-full flex-col items-center justify-center gap-4 rounded-lg text-muted-foreground ring-accent focus:ring-2 focus:outline-none"
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
      <LayoutGroup>
        <div className="flex max-w-76 gap-2 overflow-hidden py-0.5 md:max-w-88">
          <AnimatePresence mode="sync">
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
              return <ImageSlotEmpty key={`empty-${index}`} onClick={uploadOnClick} />;
            })}
          </AnimatePresence>
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
