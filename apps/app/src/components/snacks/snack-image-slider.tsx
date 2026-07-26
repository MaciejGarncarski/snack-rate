import { useHotkey } from "@tanstack/react-hotkeys";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { ImageWithPlaceholder } from "#/components/layout/image-with-placeholder";
import { cn } from "#/lib/utils";

type Direction = 1 | -1;

const variants = {
  enter: (direction: Direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: Direction) => ({ x: direction > 0 ? -80 : 80, opacity: 0 }),
};

type Props = {
  images: string[];
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

  return (
    <div className="mx-auto w-full">
      <div className="relative aspect-4/5 w-full overflow-hidden rounded-2xl border bg-muted border-border">
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
            <ImageWithPlaceholder
              src={images[index]}
              alt={`Slajd ${index + 1}`}
              className="h-full w-full object-cover"
              blurBackground
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => goTo(i)}
            className={cn(
              "min-h-none relative aspect-4/5 w-20 overflow-hidden rounded-lg border-2 p-0 transition-colors",
              i === index ? "border-accent" : "border-transparent opacity-60 hover:opacity-100",
            )}
          >
            <ImageWithPlaceholder
              src={src}
              blurBackground
              alt={`Miniatura ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
