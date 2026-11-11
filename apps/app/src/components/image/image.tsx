import { ImageOffIcon } from "lucide-react";
import { useCallback, useEffect, useState, type ImgHTMLAttributes } from "react";

import { ImageBlur } from "#/components/image/image-blur";
import { cn } from "#/lib/utils";
import { hasImageLoaded, markImageLoaded } from "#/stores/image-load-store";

// Keep in sync with the `duration-300` transition classes below.
const FADE_DURATION_MS = 300;

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

/**
 * Reveals the image once its first frame is decoded, so the fade-in never
 * paints an undecoded (blank) frame. Falls back to an immediate reveal when
 * `decode()` is unavailable (e.g. jsdom).
 */
function revealAfterDecode(img: HTMLImageElement, reveal: () => void): void {
  try {
    img.decode().then(reveal, reveal);
  } catch {
    reveal();
  }
}

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallbackComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  containerClassName?: string;
  lazy?: boolean;
  skeleton?: boolean;
  blurBackground?: boolean;
  placeholderSrc?: string;
}

function ImageInner({
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
  const [status, setStatus] = useState<Status>(() =>
    src && hasImageLoaded(src) ? "loaded" : "loading",
  );
  // The skeleton/placeholder crossfades out while the image fades in, and is
  // only unmounted after the transition, so the container is never empty.
  const [underlayHidden, setUnderlayHidden] = useState(() => !!src && hasImageLoaded(src));

  useEffect(() => {
    if (status !== "loaded") return;

    const timer = window.setTimeout(() => setUnderlayHidden(true), FADE_DURATION_MS);

    return () => window.clearTimeout(timer);
  }, [status]);

  const handleRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img?.complete) return;

      if (img.naturalWidth > 0) {
        if (src) markImageLoaded(src);
        setStatus("loaded");
        setUnderlayHidden(true);
      } else {
        setStatus("error");
      }
    },
    [src],
  );

  const aspectRatio = width && height ? `${Number(width)}/${Number(height)}` : undefined;

  const showUnderlay = status !== "error" && !underlayHidden;
  const underlayVisible = status !== "loaded";

  return (
    <div className={cn("relative overflow-hidden", containerClassName)} style={{ aspectRatio }}>
      {placeholderSrc && showUnderlay && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className={cn(
            "absolute inset-0 h-full w-full object-cover blur-xs transition-opacity duration-300",
            underlayVisible ? "opacity-100" : "opacity-0",
          )}
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}

      {skeleton && !placeholderSrc && showUnderlay && (
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-300",
            underlayVisible ? "opacity-100" : "opacity-0",
          )}
        >
          {fallbackComponent}
        </div>
      )}

      {status === "error" && errorComponent}

      {src && status !== "error" && (
        <>
          {blurBackground && status === "loaded" && <ImageBlur src={src} />}

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
            onLoad={(event) => {
              const img = event.currentTarget;

              if (src) markImageLoaded(src);
              revealAfterDecode(img, () => {
                setStatus((current) => (current === "error" ? current : "loaded"));
              });
              onLoad?.(event);
            }}
            onError={(event) => {
              setStatus("error");
              onError?.(event);
            }}
          />
        </>
      )}
    </div>
  );
}

export function Image(props: ImageProps) {
  return <ImageInner key={props.src} {...props} />;
}
