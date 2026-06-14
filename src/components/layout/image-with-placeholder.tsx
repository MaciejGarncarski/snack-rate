import { motion, AnimatePresence } from "motion/react";
import { useEffect, useRef, useState, type ComponentProps } from "react";

import { cn } from "#/lib/utils";

interface ImageWithPlaceholderProps extends ComponentProps<"img"> {
  placeholder?: React.ReactNode;
  fallback?: React.ReactNode;
  containerClassName?: string;
}

function DefaultFallback() {
  return (
    <div className="flex h-full w-full items-center justify-center rounded bg-muted text-muted-foreground">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        aria-hidden
      >
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <path d="m21 15-5-5L5 21" />
      </svg>
    </div>
  );
}

type Status = "loading" | "loaded" | "error";
const IMAGE_LOAD_SKELETON_DELAY = 50;

export function ImageWithPlaceholder({
  src,
  alt,
  placeholder,
  fallback = <DefaultFallback />,
  className,
  containerClassName,
  ...imgProps
}: ImageWithPlaceholderProps) {
  const [status, setStatus] = useState<Status>("loading");
  const [showSkeleton, setShowSkeleton] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

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
      setStatus(img.naturalWidth > 0 ? "loaded" : "error");
    } else {
      setStatus("loading");
    }
  }, [src]);

  return (
    <div key={src} className={cn("relative overflow-hidden", containerClassName)}>
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
      <img
        ref={imgRef}
        src={src}
        alt={alt}
        className={cn("block", className)}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
        {...imgProps}
      />
    </div>
  );
}
