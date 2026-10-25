import { ImageOffIcon } from "lucide-react";
import { useCallback, useState, type ImgHTMLAttributes } from "react";

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

  const handleRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (!img?.complete) return;

      if (img.naturalWidth > 0) {
        if (src) markImageLoaded(src);
        setStatus("loaded");
      } else {
        setStatus("error");
      }
    },
    [src],
  );

  const aspectRatio = width && height ? `${Number(width)}/${Number(height)}` : undefined;

  const showLoading = status === "loading";

  return (
    <div className={cn("relative overflow-hidden", containerClassName)} style={{ aspectRatio }}>
      {placeholderSrc && showLoading && (
        <img
          src={placeholderSrc}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover blur-xs"
          loading="eager"
          decoding="async"
          fetchPriority="low"
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      )}

      {skeleton && !placeholderSrc && showLoading && (
        <div className="absolute inset-0">{fallbackComponent}</div>
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
              markImageLoaded(src);
              setStatus("loaded");
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
