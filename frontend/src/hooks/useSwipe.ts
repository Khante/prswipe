import { useCallback } from "react";
import { useMotionValue, MotionValue } from "framer-motion";

export const SWIPE_THRESHOLD = 120;

export type SwipeDirection = "left" | "right" | null;

interface UseSwipeReturn {
  x: MotionValue<number>;
  direction: MotionValue<SwipeDirection>;
  isThresholdReached: MotionValue<boolean>;
  handleDragEnd: (onSwipeLeft: () => void, onSwipeRight: () => void) => boolean;
}

export function useSwipe(): UseSwipeReturn {
  const x = useMotionValue(0);
  const direction = useMotionValue<SwipeDirection>(null);
  const isThresholdReached = useMotionValue(false);

  const handleDragEnd = useCallback(
    (onSwipeLeft: () => void, onSwipeRight: () => void): boolean => {
      const currentX = x.get();

      if (currentX > SWIPE_THRESHOLD) {
        onSwipeRight();
        return true;
      } else if (currentX < -SWIPE_THRESHOLD) {
        onSwipeLeft();
        return true;
      }
      return false;
    },
    [x],
  );

  return {
    x,
    direction,
    isThresholdReached,
    handleDragEnd,
  };
}
