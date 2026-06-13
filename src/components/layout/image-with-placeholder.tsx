import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";

import { cn } from "#/lib/utils";

type Status = "loading" | "loaded" | "error";

const IMAGE_LOAD_SKELETON_DELAY = 80;

export function ImageWithPlaceholder({ src, alt }: { src: string; alt: string }) {
  const [status, setStatus] = useState<Status>("loading");
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    setStatus("loading");
    setShowSkeleton(false);

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, IMAGE_LOAD_SKELETON_DELAY);

    return () => clearTimeout(timer);
  }, [src]);

  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden">
      <AnimatePresence>
        {status === "loading" && showSkeleton && (
          <motion.div
            key="placeholder"
            className="h-full w-full animate-pulse rounded bg-muted"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        )}
      </AnimatePresence>

      <img
        src={src}
        alt={alt}
        className={cn(status === "loading" ? "absolute top-0 opacity-0" : "opacity-100")}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
    </div>
  );
}
