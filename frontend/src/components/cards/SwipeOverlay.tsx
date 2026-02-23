import { motion, useTransform, MotionValue } from "framer-motion";
import { Check, X } from "lucide-react";

interface SwipeOverlayProps {
  x: MotionValue<number>;
}

export function SwipeOverlay({ x }: SwipeOverlayProps) {
  const mergeOpacity = useTransform(x, [0, 120], [0, 1]);
  const closeOpacity = useTransform(x, [0, -120], [0, 1]);

  return (
    <>
      <motion.div
        className="absolute top-4 left-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl border-4 border-[#00e676] bg-[#00e676]/20"
        style={{
          opacity: mergeOpacity,
          pointerEvents: "none",
          transform: "rotate(-15deg)",
        }}
      >
        <Check className="w-12 h-12 text-[#00e676]" strokeWidth={3} />
        <span className="font-display text-3xl font-bold text-[#00e676]">
          MERGE
        </span>
      </motion.div>

      <motion.div
        className="absolute top-4 right-4 z-10 flex items-center gap-2 px-4 py-2 rounded-xl border-4 border-[#ff1744] bg-[#ff1744]/20"
        style={{
          opacity: closeOpacity,
          pointerEvents: "none",
          transform: "rotate(15deg)",
        }}
      >
        <X className="w-12 h-12 text-[#ff1744]" strokeWidth={3} />
        <span className="font-display text-3xl font-bold text-[#ff1744]">
          CLOSE
        </span>
      </motion.div>
    </>
  );
}
