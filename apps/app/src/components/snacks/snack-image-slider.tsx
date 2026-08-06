import { useHotkey } from "@tanstack/react-hotkeys";
import { ImageOffIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { Image } from "#/components/image/image";
import { MAXIMUM_IMAGES } from "#/const/image-const";
import { cn } from "#/lib/utils";

type Direction = 1 | -1;

const variants = {
  enter: (direction: Direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: Direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

type Props = {
  images: string[];
  slug: string;
};

export default function SnackImageSlider({ images }: Props) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<Direction>(1);

  const goTo = (newIndex: number) => {
    if (newIndex === index) return;
    setDirection(newIndex > index ? 1 : -1);
    setIndex(newIndex);
  };

  useHotkey("ArrowLeft", () => goTo((index - 1 + images.length) % images.length));
  useHotkey("ArrowRight", () => goTo((index + 1) % images.length));

  const emptySpaces = Math.max(MAXIMUM_IMAGES - images.length, 0);

  return (
    <div className="mx-auto w-full">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-4xl border bg-muted border-border">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={index}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.15, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={images[index]}
              alt={`Slajd ${index + 1}`}
              containerClassName="h-full w-full"
              className={`h-full w-full object-cover`}
              blurBackground
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "min-h-none relative w-full h-full overflow-hidden rounded-lg ring-2 p-0 transition-colors",
              i === index ? "ring-primary" : "ring-transparent opacity-80 hover:opacity-100",
            )}
          >
            <Image
              src={src}
              blurBackground
              width={100}
              height={100}
              alt={`Miniatura ${i + 1}`}
              containerClassName="h-full w-full"
              className="h-full w-full object-cover"
            />
          </button>
        ))}
        {emptySpaces > 0 &&
          Array.from({ length: emptySpaces }).map((_, i) => (
            <div
              key={i}
              className="aspect-4/5 flex-col w-full rounded-lg text-card-foreground flex items-center justify-center border text-xs gap-2 border-border bg-card"
            >
              <ImageOffIcon className="opacity-30 size-6" />
              <span className="opacity-50">Brak podglądu</span>
            </div>
          ))}
      </div>
    </div>
  );
}
