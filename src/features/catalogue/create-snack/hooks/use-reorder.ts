import { useCallback, type Dispatch } from "react";

import type { ImagePair } from "#/features/catalogue/create-snack/hooks/use-add-image";

type Props = {
  images: ImagePair[];
  onChange: (files: File[]) => void;
  setSelectedIndex: Dispatch<React.SetStateAction<number>>;
  setImages: Dispatch<React.SetStateAction<ImagePair[]>>;
};

export function useReorder({ images, onChange, setSelectedIndex, setImages }: Props) {
  const handleMove = useCallback(
    (fromIndex: number, direction: "left" | "right") => {
      const toIndex = direction === "left" ? fromIndex - 1 : fromIndex + 1;
      if (toIndex < 0 || toIndex >= images.length) return;

      setImages((prevImages) => {
        const newImages = [...prevImages];
        const [moved] = newImages.splice(fromIndex, 1);
        newImages.splice(toIndex, 0, moved);
        onChange(newImages.map((img) => img.croppedFile || img.file));
        return newImages;
      });
      setSelectedIndex(toIndex);
    },
    [images.length, onChange, setImages, setSelectedIndex],
  );

  return { handleMove };
}
