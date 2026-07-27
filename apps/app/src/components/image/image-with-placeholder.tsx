import { useSelector } from "@tanstack/react-store";
import { ImageOffIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, type ImgHTMLAttributes } from "react";
import { useInView } from "react-intersection-observer";

import { ImageBlur } from "#/components/image/image-blur";
import { cn } from "#/lib/utils";
import { imageLoadStore, markImageLoaded } from "#/stores/image-load-store";

function DefaultFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-muted text-muted-foreground">
      <ImageOffIcon />
    </div>
  );
}

type Status = "loading" | "loaded" | "error";

const IMAGE_LOAD_SKELETON_DELAY = 50;

type ImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd" | "onTransitionEnd"
>;

interface ImageWithPlaceholderProps extends ImgProps {
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  containerClassName?: string;
  lazy?: boolean;
  blurBackground?: boolean;
}

export function ImageWithPlaceholder({
  src,
  alt,
  placeholder,
  fallback = <DefaultFallback />,
  className,
  containerClassName,
  lazy,
  blurBackground = false,
  ...imgProps
}: ImageWithPlaceholderProps) {
  const [isVisible, setIsVisible] = useState(!lazy);
  const isGloballyLoaded = useSelector(imageLoadStore, (state) => (src ? state.has(src) : false));
  const [status, setStatus] = useState<Status>(() => (isGloballyLoaded ? "loaded" : "loading"));
  const [showSkeleton, setShowSkeleton] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  const { ref } = useInView({
    threshold: 0,
    onChange: (inView) => {
      if (inView) {
        setIsVisible(true);
      }
    },
  });

  useEffect(() => {
    setShowSkeleton(false);

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, IMAGE_LOAD_SKELETON_DELAY);

    return () => clearTimeout(timer);
  }, [src]);

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

  return (
    <div key={src} className={cn("relative overflow-hidden", containerClassName)} ref={ref}>
      <AnimatePresence>
        {status === "loading" && showSkeleton && (
          <motion.div
            key="placeholder"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ delay: IMAGE_LOAD_SKELETON_DELAY / 1000 }}
          >
            {placeholder ?? <div className="h-full w-full animate-pulse bg-muted" />}
          </motion.div>
        )}
      </AnimatePresence>

      {status === "error" && fallback}

      {isVisible && src ? (
        <>
          {blurBackground && status === "loaded" && <ImageBlur src={src} />}

          <motion.img
            ref={imgRef}
            src={src}
            alt={alt}
            className={cn("relative z-10 block", className)}
            initial={{ opacity: isGloballyLoaded ? 1 : 0 }}
            animate={{ opacity: status === "loaded" ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            onLoad={(e) => {
              setStatus("loaded");
              if (src) markImageLoaded(src);
              imgProps.onLoad?.(e);
            }}
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
