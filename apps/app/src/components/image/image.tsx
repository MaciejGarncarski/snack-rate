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
  return <div className="h-full w-full rounded-lg animate-pulse bg-muted" />;
}

type Status = "loading" | "loaded" | "error";

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
  loadTimeoutMs?: number;
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
  loadTimeoutMs = 5000,
  width,
  height,
  ...imgProps
}: ImageProps) {
  const isGloballyLoaded = useSelector(imageLoadStore, (state) => (src ? state.has(src) : false));
  const imgRef = useRef<HTMLImageElement>(null);
  const [isVisible, setIsVisible] = useState(!lazy);
  const [status, setStatus] = useState<Status>(() => (isGloballyLoaded ? "loaded" : "loading"));

  const handleImgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;

      if (node?.complete && node.naturalWidth > 0) {
        setStatus("loaded");

        if (src) {
          markImageLoaded(src);
        }
      }
    },
    [src],
  );

  const { ref } = useInView({
    rootMargin: "30px",
    threshold: 0,
    skip: !lazy,
    onChange: (inView) => {
      if (inView) {
        setIsVisible(true);
      }
    },
  });

  useEffect(() => {
    const img = imgRef.current;

    if (!img) {
      return;
    }

    if (img.complete) {
      const loaded = img.naturalWidth > 0;

      setStatus(loaded ? "loaded" : "error");

      if (loaded && src) {
        markImageLoaded(src);
      }

      return;
    }

    setStatus("loading");
  }, [src]);

  useEffect(() => {
    if (status !== "loading") {
      return;
    }

    const timeoutId = setTimeout(() => {
      if (!imgRef.current?.complete) {
        setStatus("error");
      }
    }, loadTimeoutMs);

    return () => clearTimeout(timeoutId);
  }, [src, status, loadTimeoutMs]);

  const handleImageLoad = (loadEvent: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setStatus("loaded");

    if (src) {
      markImageLoaded(src);
    }

    imgProps.onLoad?.(loadEvent);
  };

  const aspectRatio = width && height ? `${Number(width)}/${Number(height)}` : undefined;

  return (
    <div
      className={cn("relative overflow-hidden", containerClassName)}
      ref={ref}
      style={{
        aspectRatio,
      }}
    >
      {skeleton && (
        <AnimatePresence>
          {status === "loading" && (
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
            width={width}
            height={height}
            className={cn("relative z-10 block", className)}
            initial={false}
            animate={{
              opacity: status === "loaded" ? 1 : 0,
            }}
            transition={{
              duration: 0.2,
            }}
            onLoad={handleImageLoad}
            onError={(event) => {
              setStatus("error");
              imgProps.onError?.(event);
            }}
            {...imgProps}
          />
        </>
      ) : null}
    </div>
  );
}

export function Image(props: ImageProps) {
  return <ImageInner {...props} />;
}
