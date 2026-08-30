import { useHotkey } from "@tanstack/react-hotkeys";
import { ImageOffIcon } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "motion/react";
import { useState } from "react";

import { Image } from "#/components/image/image";
import { AspectRatio } from "#/components/ui/aspect-ratio";
import { Card, CardContent } from "#/components/ui/card";
import { ImageZoom } from "#/components/ui/zoom";
import { MAXIMUM_IMAGES } from "#/const/image-const";
import { cn } from "#/lib/utils";

type Direction = 1 | -1;

const X_OFFSET = 300;

const variants: Variants = {
  enter: (direction: Direction) => ({
    x: direction > 0 ? X_OFFSET : -X_OFFSET,
    opacity: 0,
    scale: 0.96,
    transition: {
      duration: 0.25,
      ease: [0.22, 1, 0.36, 1],
    },
  }),

  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.35,
      ease: [0.22, 1, 0.36, 1],
    },
  },

  exit: (direction: Direction) => ({
    x: direction > 0 ? -X_OFFSET : X_OFFSET,
    opacity: 0,
    scale: 1.04,
    transition: {
      duration: 0.1,
      ease: [0.4, 0, 1, 1],
    },
  }),
};

type Props = {
  images: string[];
  thumbnailUrls: string[];
  slug: string;
};

export default function SnackImageSlider({ images, thumbnailUrls }: Props) {
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
    <Card size="sm" className="w-full">
      <CardContent>
        <AspectRatio
          ratio={4 / 5}
          className="w-full overflow-hidden rounded-3xl border bg-muted border-border/70 shadow-md"
        >
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              key={`snack-image-${index}`}
              transition={{ duration: 0.15, ease: "easeInOut" }}
              className="absolute inset-0 h-full w-full p-0"
            >
              <ImageZoom>
                <Image
                  width={382}
                  height={478}
                  src={images[index]}
                  alt={`Slajd ${index + 1}`}
                  containerClassName="h-full w-full"
                  className={`h-full w-full object-cover`}
                  blurBackground
                />
              </ImageZoom>
            </motion.div>
          </AnimatePresence>
        </AspectRatio>

        <div className="mt-4 grid grid-cols-3 gap-4">
          {thumbnailUrls.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => goTo(i)}
              className={cn(
                "min-h-none shadow relative w-full h-full overflow-hidden rounded-lg ring-2 p-0 transition-colors",
                i === index ? "ring-primary" : "ring-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image
                src={src}
                blurBackground
                width={80}
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
                className="aspect-4/5 shadow flex-col w-full rounded-lg text-card-foreground flex items-center justify-center border text-xs gap-2 border-border/70 bg-muted"
              >
                <ImageOffIcon className="opacity-30 size-6" />
                <span className="sr-only">Brak podglądu</span>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
