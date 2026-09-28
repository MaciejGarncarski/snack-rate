import { ImageOffIcon } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ImgHTMLAttributes,
  type SyntheticEvent,
} from "react";

import { ImageBlur } from "#/components/image/image-blur";
import { cn } from "#/lib/utils";
import { hasImageLoaded, markImageLoaded } from "#/stores/image-load-store";

function DefaultError() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-muted text-muted-foreground">
      <ImageOffIcon />
    </div>
  );
}

function DefaultFallback() {
  return <div className="h-full w-full animate-pulse rounded-lg bg-muted" />;
}

type Status = "loading" | "loaded" | "error";

interface ImageState {
  /** `src` the `status` was resolved for. */
  src: string | undefined;
  status: Status;
}

function getInitialState(src: string | undefined): ImageState {
  return { src, status: src && hasImageLoaded(src) ? "loaded" : "loading" };
}

type HtmlImgProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "onAnimationStart" | "onAnimationEnd" | "onDrag" | "onDragStart" | "onDragEnd" | "onTransitionEnd"
>;

export interface ImageProps extends HtmlImgProps {
  fallbackComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  containerClassName?: string;
  lazy?: boolean;
  skeleton?: boolean;
  blurBackground?: boolean;
  placeholderSrc?: string;
}

export function ImageInner({
  src,
  alt = "",
  fallbackComponent = <DefaultFallback />,
  errorComponent = <DefaultError />,
  className,
  containerClassName,
  lazy = true,
  skeleton = true,
  blurBackground = false,
  placeholderSrc,
  width,
  height,
  onLoad,
  onError,
  ...imgProps
}: ImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  // Sources loaded earlier in this session start as `loaded`, so a cached image
  // renders right away instead of flashing the skeleton and fading in.
  const [state, setState] = useState<ImageState>(() => getInitialState(src));

  if (state.src !== src) {
    // Resolve a new `src` while rendering, otherwise the previous status would be
    // painted for it.
    setState(getInitialState(src));
  }

  const status = state.status;

  const setStatus = useCallback(
    (nextStatus: Status) => {
      setState({ src, status: nextStatus });
    },
    [src],
  );

  // Runs before the browser paints, so an image that is already available is
  // never rendered with the skeleton first.
  const resolveInitialStatus = useCallback(() => {
    const img = imgRef.current;

    // Nothing to resolve yet — the load or error event settles the status later,
    // and an image known from the load cache keeps its `loaded` status.
    if (!img?.complete) {
      return;
    }

    if (img.naturalWidth === 0) {
      setStatus("error");
      return;
    }

    if (src) {
      markImageLoaded(src);
    }

    setStatus("loaded");
  }, [setStatus, src]);

  const handleRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgRef.current = node;

      if (node) {
        resolveInitialStatus();
      }
    },
    [resolveInitialStatus],
  );

  useLayoutEffect(() => {
    resolveInitialStatus();
  }, [resolveInitialStatus]);

  const handleLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    if (src) {
      markImageLoaded(src);
    }

    setStatus("loaded");
    onLoad?.(event);
  };

  const handleError = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    setStatus("error");
    onError?.(event);
  };

  const aspectRatio = width && height ? `${Number(width)}/${Number(height)}` : undefined;

  const showLoading = status === "loading";
  const showError = status === "error";
  const showImage = Boolean(src);

  return (
    <div className={cn("relative overflow-hidden", containerClassName)} style={{ aspectRatio }}>
      {placeholderSrc && showLoading && (
        <AnimatePresence>
          <motion.img
            key="placeholder"
            src={placeholderSrc}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover blur-xs"
            loading="eager"
            decoding="async"
            fetchPriority="low"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        </AnimatePresence>
      )}

      {skeleton && !placeholderSrc && showLoading && (
        <AnimatePresence>
          <motion.div
            key="fallback"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {fallbackComponent}
          </motion.div>
        </AnimatePresence>
      )}

      {showError && errorComponent}

      {showImage && !showError && (
        <>
          {blurBackground && status === "loaded" && src && <ImageBlur src={src} />}

          <img
            {...imgProps}
            ref={handleRef}
            src={src}
            alt={alt}
            width={width}
            height={height}
            loading={lazy ? "lazy" : "eager"}
            decoding="async"
            fetchPriority={lazy ? "low" : "high"}
            className={cn(
              "relative z-10 block transition-opacity duration-300",
              status === "loaded" ? "opacity-100" : "opacity-0",
              className,
            )}
            onLoad={handleLoad}
            onError={handleError}
          />
        </>
      )}
    </div>
  );
}

export function Image(props: ImageProps) {
  return <ImageInner {...props} />;
}
