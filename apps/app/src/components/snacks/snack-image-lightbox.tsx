import { useHotkey } from "@tanstack/react-hotkeys";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ExpandIcon,
  XIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Dialog as DialogPrimitive, Modal as ModalPrimitive } from "react-aria-components";
import { TransformComponent, TransformWrapper, useTransformComponent } from "react-zoom-pan-pinch";

import { Image } from "#/components/image/image";
import { Button } from "#/components/ui/button";
import { DialogOverlay, DialogTitle } from "#/components/ui/dialog";
import { Tooltip, TooltipTrigger } from "#/components/ui/tooltip";
import { cn } from "#/lib/utils";

type Props = {
  images: string[];
  thumbnailUrls: string[];
  index: number;
  open: boolean;
  onIndexChange: (index: number) => void;
  onOpenChange: (open: boolean) => void;
};

function ZoomPercentLabel() {
  const scale = useTransformComponent((context) => context.state.scale);

  return <span className="tabular-nums">{`${Math.round(scale * 100)}%`}</span>;
}

export function SnackImageLightbox({
  images,
  thumbnailUrls,
  index,
  open,
  onIndexChange,
  onOpenChange,
}: Props) {
  const count = images.length;

  const goTo = (newIndex: number) => {
    if (count === 0) return;
    onIndexChange((newIndex + count) % count);
  };

  const goNext = () => goTo(index + 1);
  const goPrev = () => goTo(index - 1);

  useHotkey("ArrowLeft", goPrev, { enabled: open });
  useHotkey("ArrowRight", goNext, { enabled: open });
  useHotkey("Escape", () => onOpenChange(false), { enabled: open });

  if (count === 0) return null;

  return (
    <DialogOverlay
      isOpen={open}
      onOpenChange={(value) => {
        if (!value) onOpenChange(false);
      }}
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
          {/* Top bar */}
          <div className="relative z-10 flex items-center justify-between gap-2 px-4 pt-4 text-white sm:px-6">
            <p className="text-sm font-medium tabular-nums opacity-80" aria-live="polite">
              {index + 1} / {count}
            </p>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                onPress={() => onOpenChange(false)}
                aria-label="Zamknij podgląd"
                className="size-11 rounded-full bg-red-500/20 text-red-100 hover:bg-red-500/30 hover:text-white [&_svg:not([class*='size-'])]:size-5"
              >
                <XIcon />
              </Button>
              <Tooltip placement="bottom">Zamknij podgląd</Tooltip>
            </TooltipTrigger>
          </div>
          {/* Stage */}
          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 sm:px-20">
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
              {({ zoomIn, zoomOut, resetTransform }) => (
                <div className="flex h-full w-full flex-col items-center justify-center ">
                  <div className="flex min-h-0 w-full flex-1 items-center justify-center rounded-2xl overflow-hidden">
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.div
                        key={`lightbox-image-${index}`}
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="h-full w-full"
                      >
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
                          <img
                            src={images[index]}
                            alt={`Zdjęcie ${index + 1} z ${count}`}
                            draggable={false}
                            loading="eager"
                            decoding="async"
                            className="bg-neutral-800 max-h-[62dvh] w-auto max-w-full cursor-zoom-in rounded-2xl object-contain border border-white/5 shadow-2xl select-none sm:max-h-[68dvh]"
                          />
                        </TransformComponent>
                      </motion.div>
                    </AnimatePresence>
                  </div>

                  {/* Zoom controls */}
                  <div className="flex items-center gap-2 py-3">
                    {count > 1 && (
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onPress={goPrev}
                          aria-label="Poprzednie zdjęcie"
                          className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:hidden"
                        >
                          <ChevronLeftIcon />
                        </Button>
                        <Tooltip>Poprzednie zdjęcie</Tooltip>
                      </TooltipTrigger>
                    )}
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onPress={() => void zoomOut(0.4)}
                        aria-label="Pomniejsz"
                        className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                      >
                        <ZoomOutIcon className="size-3 sm:size-5" />
                      </Button>
                      <Tooltip>Pomniejsz</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="sm"
                        onPress={() => void resetTransform()}
                        aria-label="Resetuj powiększenie"
                        className="min-w-16 bg-white/10 text-xs font-medium text-white hover:bg-white/20 hover:text-white sm:h-10 gap-2 sm:px-4"
                      >
                        <ExpandIcon className="size-4 sm:size-5" />
                        <ZoomPercentLabel />
                      </Button>
                      <Tooltip>Resetuj powiększenie</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onPress={() => void zoomIn(0.4)}
                        aria-label="Powiększ"
                        className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:size-10"
                      >
                        <ZoomInIcon className="size-3 sm:size-5" />
                      </Button>
                      <Tooltip>Powiększ</Tooltip>
                    </TooltipTrigger>
                    {count > 1 && (
                      <TooltipTrigger>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onPress={goNext}
                          aria-label="Następne zdjęcie"
                          className="bg-white/10 text-white hover:bg-white/20 hover:text-white sm:hidden"
                        >
                          <ChevronRightIcon />
                        </Button>
                        <Tooltip>Następne zdjęcie</Tooltip>
                      </TooltipTrigger>
                    )}
                  </div>
                </div>
              )}
            </TransformWrapper>
            {/* Prev / next */}
            {count > 1 && (
              <>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={goPrev}
                    aria-label="Poprzednie zdjęcie"
                    className="absolute top-1/2 left-2 z-10 hidden -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:left-4 sm:inline-flex sm:size-12"
                  >
                    <ChevronLeftIcon className="size-4 sm:size-6" />
                  </Button>
                  <Tooltip>Poprzednie zdjęcie</Tooltip>
                </TooltipTrigger>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onPress={goNext}
                    aria-label="Następne zdjęcie"
                    className="absolute top-1/2 right-2 z-10 hidden -translate-y-1/2 bg-white/10 text-white hover:bg-white/20 hover:text-white sm:right-4 sm:inline-flex sm:size-12"
                  >
                    <ChevronRightIcon className="size-4 sm:size-6" />
                  </Button>
                  <Tooltip>Następne zdjęcie</Tooltip>
                </TooltipTrigger>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {count > 1 && (
            <div className="relative z-10 flex justify-center gap-2 overflow-x-auto px-4 pt-3 pb-5">
              {thumbnailUrls.map((src, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Pokaż zdjęcie ${i + 1}`}
                  aria-current={i === index}
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
