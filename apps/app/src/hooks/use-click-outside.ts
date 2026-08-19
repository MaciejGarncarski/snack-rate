import { useEffect, type RefObject } from "react";

type AnyEvent = MouseEvent | TouchEvent;

export function useClickOutside<T extends HTMLElement>(
  ref: RefObject<T | null>,
  handler: (event: AnyEvent) => void,
) {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el = ref.current;

      // SAFETY: mousedown/touchstart event targets are always DOM Nodes.
      if (!el || el.contains(event.target as Node)) return;

      handler(event);
    };

    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);

    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}
