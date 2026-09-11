import { useEffect, useRef } from "react";

export function useSwipeNavigation({
  enabled,
  scaleRef,
  onSwipeLeft,
  onSwipeRight,
}: {
  enabled: boolean;
  scaleRef: React.RefObject<number>;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
}) {
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const onSwipeLeftRef = useRef(onSwipeLeft);
  const onSwipeRightRef = useRef(onSwipeRight);

  useEffect(() => {
    onSwipeLeftRef.current = onSwipeLeft;
    onSwipeRightRef.current = onSwipeRight;
  }, [onSwipeLeft, onSwipeRight]);

  useEffect(() => {
    if (!enabled) return;

    const SWIPE_THRESHOLD = 50;
    const VELOCITY_THRESHOLD = 0.3;

    const handleTouchStart = (e: TouchEvent) => {
      if (scaleRef.current !== 1) {
        touchStartRef.current = null;
        return;
      }
      const touch = e.touches[0];
      touchStartRef.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      if (scaleRef.current !== 1) {
        touchStartRef.current = null;
        return;
      }

      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const dt = Date.now() - touchStartRef.current.time;
      const velocity = dt > 0 ? Math.abs(dx) / dt : 0;

      touchStartRef.current = null;

      if (Math.abs(dx) <= Math.abs(dy) * 1.5) return;

      if (dx < -SWIPE_THRESHOLD || (dx < -10 && velocity > VELOCITY_THRESHOLD)) {
        onSwipeLeftRef.current();
      } else if (dx > SWIPE_THRESHOLD || (dx > 10 && velocity > VELOCITY_THRESHOLD)) {
        onSwipeRightRef.current();
      }
    };

    document.addEventListener("touchstart", handleTouchStart, { passive: true });
    document.addEventListener("touchend", handleTouchEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [enabled, scaleRef]);
}
