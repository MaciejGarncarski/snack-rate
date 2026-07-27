import { createStore } from "@tanstack/react-store";

const MAX_SIZE = 300;

export const imageLoadStore = createStore(new Set<string>());

export function markImageLoaded(src: string): void {
  imageLoadStore.setState((prev) => {
    if (prev.has(src)) {
      return prev;
    }

    const next = new Set([...prev, src]);

    if (next.size <= MAX_SIZE) {
      return next;
    }

    while (next.size > MAX_SIZE) {
      const oldest = next.values().next().value;
      if (oldest === undefined) break;
      next.delete(oldest);
    }

    return next;
  });
}
