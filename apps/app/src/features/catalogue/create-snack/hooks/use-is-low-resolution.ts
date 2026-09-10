import { useEffect, useState } from "react";

import { isLowResolution } from "#/features/catalogue/create-snack/utils/is-low-resolution";

type Source = {
  file?: File | null;
  src?: string;
};

type State = {
  file?: File | null;
  src?: string;
  isLow: boolean;
};

export function useIsLowResolution({ file, src }: Source): boolean {
  const [state, setState] = useState<State>({ file, src, isLow: false });

  if (state.file !== file || state.src !== src) {
    setState({ file, src, isLow: false });
  }

  useEffect(() => {
    const url = src ?? (file ? URL.createObjectURL(file) : "");
    if (!url) return;

    let cancelled = false;
    const createdUrl = !src && Boolean(file);

    const img = new Image();
    const handleLoad = () => {
      if (cancelled) return;
      setState((prev) => ({
        ...prev,
        isLow: isLowResolution(img.naturalWidth, img.naturalHeight),
      }));
    };
    const handleError = () => {
      if (!cancelled) setState((prev) => ({ ...prev, isLow: false }));
    };

    img.addEventListener("load", handleLoad);
    img.addEventListener("error", handleError);
    img.src = url;

    return () => {
      cancelled = true;
      img.removeEventListener("load", handleLoad);
      img.removeEventListener("error", handleError);
      if (createdUrl) URL.revokeObjectURL(url);
    };
  }, [file, src]);

  return state.isLow;
}
