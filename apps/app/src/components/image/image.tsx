import { ClientOnly } from "@tanstack/react-router";
import { useSelector } from "@tanstack/react-store";
import { ImageOffIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { useInView } from "react-intersection-observer";

import { ImageBlur } from "#/components/image/image-blur";
import { cn } from "#/lib/utils";
import { imageLoadStore, markImageLoaded } from "#/stores/image-load-store";

function DefaultError() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-muted text-muted-foreground">
      <ImageOffIcon />
    </div>
  );
}

function DefaultFallback() {
  return <div className="h-full w-full animate-pulse bg-muted" />;
}

type Status = "loading" | "loaded" | "error";

const IMAGE_LOAD_SKELETON_DELAY = 50;

type HtmlImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd" | "onTransitionEnd"
>;

interface ImageProps extends HtmlImgProps {
  fallbackComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  containerClassName?: string;
  lazy?: boolean;
  skeleton?: boolean;
  blurBackground?: boolean;
}

export function ImageInner({
  src,
  alt,
  fallbackComponent = <DefaultFallback />,
  errorComponent = <DefaultError />,
  className,
  containerClassName,
  lazy = false,
  blurBackground = false,
  skeleton = true,
  ...imgProps
}: ImageProps) {
  const [isVisible, setIsVisible] = useState(!lazy);
  const isGloballyLoaded = useSelector(imageLoadStore, (state) => (src ? state.has(src) : false));
  const [status, setStatus] = useState<Status>(() => (isGloballyLoaded ? "loaded" : "loading"));
  const [showSkeleton, setShowSkeleton] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleImgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;
      if (node && node.complete && node.naturalWidth > 0) {
        setStatus("loaded");
        if (src) markImageLoaded(src);
      }
    },
    [src],
  );

  const { ref } = useInView({
    rootMargin: "30px",
    threshold: 0,
    onChange: (inView) => {
      if (inView) {
        setIsVisible(true);
      }
    },
  });

  useEffect(() => {
    if (!skeleton) return;

    setShowSkeleton(false);

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, IMAGE_LOAD_SKELETON_DELAY);

    return () => clearTimeout(timer);
  }, [src, skeleton]);

  useEffect(() => {
    const img = imgRef.current;

    if (!img) return;

    if (img.complete) {
      const loaded = img.naturalWidth > 0;
      setStatus(loaded ? "loaded" : "error");
      if (loaded && src) markImageLoaded(src);
    } else {
      setStatus("loading");
    }
  }, [src]);

  const handleImageLoad = (loadEvent: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setStatus("loaded");
    if (src) markImageLoaded(src);
    imgProps.onLoad?.(loadEvent);
  };

  return (
    <div key={src} className={cn("relative overflow-hidden", containerClassName)} ref={ref}>
      {skeleton && (
        <AnimatePresence>
          {status === "loading" && showSkeleton && (
            <motion.div
              key="fallback"
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {fallbackComponent}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {status === "error" && errorComponent}

      {isVisible && src ? (
        <>
          {blurBackground && status === "loaded" && <ImageBlur src={src} />}

          <motion.img
            ref={handleImgRef}
            src={src}
            alt={alt}
            className={cn("relative z-10 block", className)}
            initial={false}
            animate={{ opacity: status === "loaded" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onLoad={handleImageLoad}
            onError={(e) => {
              setStatus("error");
              imgProps.onError?.(e);
            }}
            {...imgProps}
          />
        </>
      ) : null}
    </div>
  );
}

function ImageSSRFallback({
  src,
  alt,
  className,
  containerClassName,
  lazy = false,
  skeleton = true,
  fallbackComponent = <DefaultFallback />,
  ...imgProps
}: ImageProps) {
  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {lazy ? (
        skeleton && fallbackComponent
      ) : src ? (
        <img src={src} alt={alt} className={cn("relative z-10 block", className)} {...imgProps} />
      ) : null}
    </div>
  );
}

export function Image(props: ImageProps) {
  return (
    <ClientOnly fallback={<ImageSSRFallback {...props} />}>
      <ImageInner {...props} />
    </ClientOnly>
  );
}
