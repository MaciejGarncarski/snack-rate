import { createStore } from "@tanstack/react-store";

export const imageLoadStore = createStore(new Set<string>());

export function markImageLoaded(src: string): void {
  imageLoadStore.setState((prev) => {
    if (prev.has(src)) return prev;
    return new Set([...prev, src]);
  });
}
