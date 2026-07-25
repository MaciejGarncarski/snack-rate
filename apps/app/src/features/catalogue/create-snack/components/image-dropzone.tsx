import { ImageOffIcon, ImageUpIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useRef, useState } from "react";

import type { ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";
import { validateImage } from "#/features/catalogue/create-snack/utils/validate-image";
import type { ImageValidationError } from "#/features/catalogue/create-snack/utils/validate-image";

type Props = {
  images: ImagePair[];
  handleAddToQueue: (file: File) => void;
  onValidationError: (error: ImageValidationError) => void;
  selectedImage: ImagePair | null;
  onUploadClick: () => void;
};

export const ImageDropzone = ({
  images,
  handleAddToQueue,
  onValidationError,
  selectedImage,
  onUploadClick,
}: Props) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);

  const processDroppedFiles = useCallback(
    async (files: File[]) => {
      for (const file of files) {
        const validationResult = await validateImage(
          file,
          images.map((img) => img.file),
        );

        if (validationResult instanceof File) {
          handleAddToQueue(validationResult);
          return;
        }
        onValidationError(validationResult);
      }
    },
    [handleAddToQueue, images, onValidationError],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (dragCounter.current === 1) {
      setIsDragOver(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounter.current = 0;
      setIsDragOver(false);

      const files = Array.from(e.dataTransfer.files);

      processDroppedFiles(files);
    },
    [processDroppedFiles],
  );

  return (
    <motion.div
      className="relative flex aspect-4/5 h-auto w-full items-center justify-center rounded-lg ring-ring ring-offset-2 ring-offset-background focus-within:ring-2"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      <div className="relative size-full overflow-hidden rounded-lg border border-accent">
        <AnimatePresence mode="popLayout">
          {selectedImage ? (
            <motion.img
              key={selectedImage.id}
              src={selectedImage.croppedFileUrl}
              alt="Wybrany obraz"
              draggable={false}
              className="size-full object-cover select-none"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          ) : (
            <motion.button
              key="no-image"
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onUploadClick}
              className="absolute left-0 flex select-none h-full w-full flex-col items-center justify-center gap-4 rounded-lg bg-input/50 text-muted-foreground outline-none"
            >
              <ImageOffIcon />
              <p>Brak obrazu</p>
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {isDragOver && (
            <motion.div
              initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
              animate={{ opacity: 1, backdropFilter: "blur(4px)" }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-lg border border-accent bg-background/80"
            >
              <ImageUpIcon className="size-12 text-foreground" />
              <p className="text-sm font-medium text-foreground">Upuść obraz tutaj</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};
