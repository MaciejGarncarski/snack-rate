import { useHotkey } from "@tanstack/react-hotkeys";
import { ChevronLeftIcon, ChevronRightIcon, XIcon, ZoomInIcon, ZoomOutIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { Dialog as DialogPrimitive, Modal as ModalPrimitive } from "react-aria-components";
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch";

import { Image } from "#/components/image/image";
import { Button, buttonVariants } from "#/components/ui/button";
import { DialogOverlay, DialogTitle } from "#/components/ui/dialog";
import { useIsMobile } from "#/hooks/use-mobile";
import { useSwipeNavigation } from "#/hooks/use-swipe-navigation";
import { cn } from "#/lib/utils";

type Props = {
  images: string[];
  thumbnailUrls: string[];
  index: number;
  open: boolean;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
};

export function SnackImageLightbox({
  images,
  thumbnailUrls,
  index,
  open,
  onIndexChange,
  onOpenChange,
}: Props) {
  const count = images.length;
  const isMobile = useIsMobile();
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const scaleRef = useRef(1);

  const goTo = (newIndex: number) => {
    if (count === 0) return;
    onIndexChange((newIndex + count) % count);
  };

  const goNext = () => {
    setDirection("next");
    goTo(index + 1);
  };

  const goPrev = () => {
    setDirection("prev");
    goTo(index - 1);
  };

  useHotkey("ArrowLeft", goPrev, { enabled: open && count > 1 });
  useHotkey("ArrowRight", goNext, { enabled: open && count > 1 });

  useSwipeNavigation({
    enabled: isMobile && count > 1,
    scaleRef,
    onSwipeLeft: goNext,
    onSwipeRight: goPrev,
  });

  const xOffset = direction === "next" ? 10 : -10;

  if (count === 0) return null;

  return (
    <DialogOverlay
      isOpen={open}
      onOpenChange={onOpenChange}
      className="bg-black/90 supports-backdrop-filter:backdrop-blur-lg z-999"
    >
      <ModalPrimitive
        data-slot="snack-image-lightbox"
        className="fixed inset-0 z-50 flex h-dvh w-dvw flex-col bg-transparent outline-none"
      >
        <DialogPrimitive
          aria-label="Podgląd zdjęć produktu"
          className="flex h-full w-full flex-col outline-none"
        >
          <DialogTitle className="sr-only">Podgląd zdjęć produktu</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onPress={() => onOpenChange(false)}
            aria-label="Zamknij podgląd"
            className="size-11 md:size-15 md:right-8 md:top-8 absolute right-4 top-4 z-10 rounded-3xl ml-auto bg-primary/80 backdrop-blur-md text-white hover:bg-white/20"
          >
            <XIcon className="size-5 md:size-6" />
          </Button>
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
            <AnimatePresence initial={false} mode="popLayout">
              <div className="h-full w-full">
                <TransformWrapper
                  key={`zoom-${index}`}
                  initialScale={1}
                  minScale={1}
                  maxScale={5}
                  centerOnInit
                  centerZoomedOut
                  limitToBounds={true}
                  wheel={{ step: 0.005 }}
                  doubleClick={{ mode: "toggle" }}
                  panning={{ velocityDisabled: false }}
                >
                  {({ zoomIn, zoomOut }) => (
                    <div className="flex h-full w-full flex-col items-center justify-center ">
                      <div className="flex min-h-0 w-full flex-1 items-center justify-center rounded-4xl overflow-hidden">
                        <TransformComponent
                          wrapperStyle={{ width: "100%", height: "100%" }}
                          contentStyle={{
                            width: "100%",
                            height: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <motion.img
                            src={images[index]}
                            key={`image-${index}`}
                            initial={{ opacity: 0, x: xOffset }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -xOffset }}
                            transition={{ duration: 0.2, ease: "linear" }}
                            alt={`Zdjęcie ${index + 1} z ${count}`}
                            draggable={false}
                            loading="eager"
                            decoding="async"
                            className="bg-neutral-800 max-h-[62dvh] w-auto max-w-full cursor-zoom-in rounded-4xl object-contain border border-white/5 shadow-2xl select-none sm:max-h-[68dvh]"
                          />
                        </TransformComponent>
                      </div>

                      <div className="flex items-center gap-2 py-3">
                        {count > 1 && isMobile && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onPress={goPrev}
                            aria-label="Poprzednie zdjęcie"
                            className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                          >
                            <ChevronLeftIcon />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onPress={() => void zoomOut(0.4)}
                          aria-label="Pomniejsz"
                          className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                        >
                          <ZoomOutIcon className="size-3 sm:size-5" />
                        </Button>
                        <p
                          className={buttonVariants({
                            variant: "ghost",
                            size: "sm",
                            className:
                              "bg-white/10 min-w-14 text-white hover:bg-white/20 hover:text-white sm:size-10",
                          })}
                          aria-live="polite"
                        >
                          {index + 1} / {count}
                        </p>

                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onPress={() => void zoomIn(0.4)}
                          aria-label="Powiększ"
                          className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                        >
                          <ZoomInIcon className="size-3 sm:size-5" />
                        </Button>
                        {count > 1 && isMobile && (
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onPress={goNext}
                            aria-label="Następne zdjęcie"
                            className="bg-white/10 text-white hover:bg-white/20 hover:text-white"
                          >
                            <ChevronRightIcon />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </TransformWrapper>
              </div>
            </AnimatePresence>

            {count > 1 && !isMobile && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={goPrev}
                  aria-label="Poprzednie zdjęcie"
                  className="absolute top-1/2 left-2 z-10 -translate-y-1/2 bg-white/20 text-white hover:bg-white/15 hover:text-white sm:left-4 sm:size-12"
                >
                  <ChevronLeftIcon className="size-4 sm:size-6" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={goNext}
                  aria-label="Następne zdjęcie"
                  className="absolute top-1/2 right-2 z-10 -translate-y-1/2 bg-white/20 text-white hover:bg-white/15 hover:text-white sm:right-4 sm:size-12"
                >
                  <ChevronRightIcon className="size-4 sm:size-6" />
                </Button>
              </>
            )}
          </div>

          {count > 1 && (
            <div className="relative z-10 flex justify-center gap-2 overflow-x-auto px-4 pt-3 pb-5">
              {thumbnailUrls.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Pokaż zdjęcie ${i + 1}`}
                  aria-current={i === index ? "true" : undefined}
                  className={cn(
                    "h-16 w-13 shrink-0 overflow-hidden rounded-md ring-2 transition-[box-shadow,opacity] outline-none",
                    i === index
                      ? "ring-primary"
                      : "opacity-60 ring-transparent hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-white/70",
                  )}
                >
                  <Image
                    src={src}
                    width={52}
                    height={64}
                    alt=""
                    aria-hidden
                    containerClassName="h-full w-full"
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </DialogPrimitive>
      </ModalPrimitive>
    </DialogOverlay>
  );
}
