import { useCallback, useState } from "react";

import type { ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";

type QueueItem = {
  id: string;
  file: File;
  originalImageId?: string;
};

type Props = {
  images: ImagePair[];
  setImages: React.Dispatch<React.SetStateAction<ImagePair[]>>;
  onChange: (files: File[]) => void;
  foundSelectedImage: ImagePair | null;
};

export function useCropQueue({ images, setImages, onChange, foundSelectedImage }: Props) {
  const [cropQueue, setCropQueue] = useState<QueueItem[]>([]);
  const currentQueueItem = cropQueue[0] || null;
  const isCropDialogOpen = currentQueueItem !== null;

  const handleCropComplete = useCallback(
    (croppedFile: File) => {
      if (!currentQueueItem) return;

      const currentImage = images.find((img) => img.id === currentQueueItem.originalImageId);

      if (currentQueueItem.originalImageId && currentImage) {
        setImages((prevImages) => {
          const newImages = prevImages.map((img) =>
            img.id === currentQueueItem.originalImageId
              ? {
                  ...img,
                  croppedFileUrl: URL.createObjectURL(croppedFile),
                  croppedFile: croppedFile,
                }
              : img,
          );
          onChange(newImages.map((img) => img.croppedFile || img.file));
          return newImages;
        });

        return;
      }

      const newImagePair: ImagePair = {
        id: crypto.randomUUID(),
        file: currentQueueItem.file,
        croppedFileUrl: URL.createObjectURL(croppedFile),
        croppedFile: croppedFile,
      };

      setImages((prevImages) => {
        const newImages = [...prevImages, newImagePair];
        onChange(newImages.map((img) => img.croppedFile || img.file));
        return newImages;
      });

      setCropQueue((prev) => prev.slice(1));
    },
    [currentQueueItem, images, onChange, setImages],
  );

  const handleCropCancel = useCallback(() => {
    setCropQueue((prev) => prev.slice(1));
  }, []);

  const handleAddToQueue = useCallback((file: File) => {
    setCropQueue((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        file,
      },
    ]);
  }, []);

  const handleRecrop = useCallback(() => {
    if (!foundSelectedImage) return;

    setCropQueue((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        file: foundSelectedImage.file,
        originalImageId: foundSelectedImage.id,
      },
    ]);
  }, [foundSelectedImage]);

  return {
    currentQueueItem,
    isCropDialogOpen,
    handleCropComplete,
    handleCropCancel,
    handleAddToQueue,
    handleRecrop,
  };
}
