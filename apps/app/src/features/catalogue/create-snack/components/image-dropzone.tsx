import { CameraIcon, ImageUpIcon } from "lucide-react";
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
    if (dragCounter.current === 1) setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) setIsDragOver(false);
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
    <div
      className="relative flex aspect-4/5 size-full items-center justify-center"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {selectedImage ? (
        <div className="size-full select-none" key={selectedImage.id}>
          <img
            src={selectedImage.croppedFileUrl}
            alt="Wybrany obraz"
            draggable={false}
            className="size-full object-cover select-none"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={onUploadClick}
          className="group flex size-full flex-col items-center justify-center gap-3 bg-zinc-50 text-zinc-500 transition-colors hover:bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700/60"
        >
          <div className="flex size-14 items-center justify-center rounded-full border border-dashed border-zinc-300 bg-white shadow-sm transition-colors group-hover:border-zinc-400 dark:border-zinc-600 dark:bg-zinc-900">
            <CameraIcon className="size-6 text-zinc-400 group-hover:text-zinc-600 dark:text-zinc-500" />
          </div>
          <div className="flex flex-col items-center gap-1">
            <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Dodaj zdjęcie
            </span>
            <span className="text-xs text-zinc-400 dark:text-zinc-500">
              kliknij lub przeciągnij plik
            </span>
          </div>
          <span className="mt-1 rounded-full bg-primary px-3 py-1 text-xs font-medium text-primary-foreground">
            Wybierz plik
          </span>
        </button>
      )}

      <AnimatePresence>
        {isDragOver && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 bg-white/85 backdrop-blur-sm dark:bg-zinc-900/85"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
              <ImageUpIcon className="size-6" />
            </div>
            <p className="text-sm font-medium text-zinc-900 dark:text-white">Upuść obraz tutaj</p>
            <p className="text-xs text-zinc-500">JPG, PNG, WebP · maks. 10 MB</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
