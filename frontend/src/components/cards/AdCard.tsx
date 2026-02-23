import {
  motion,
  useTransform,
  useMotionValue,
  PanInfo,
  useAnimationControls,
} from "framer-motion";

interface AdCardProps {
  onDismiss: () => void;
  isTopCard?: boolean;
}

export function AdCard({ onDismiss, isTopCard = false }: AdCardProps) {
  const dragX = useMotionValue(0);
  const rotate = useTransform(dragX, [-100, 0, 100], [-30, 0, 30]);
  const controls = useAnimationControls();

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isTopCard) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (Math.abs(offset) > 120 || Math.abs(velocity) > 500) {
      onDismiss();
    } else {
      controls.start({
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      });
    }
  };

  return (
    <motion.div
      animate={controls}
      style={{ rotate, transformOrigin: "bottom center" }}
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      dragListener={false}
      onPan={isTopCard ? (_, info) => dragX.set(info.offset.x) : undefined}
      onPanEnd={isTopCard ? handleDragEnd : undefined}
      whileDrag={{ cursor: "grabbing" }}
      className="w-full max-w-md rounded-2xl overflow-hidden cursor-grab relative h-[520px]"
    >
      {/* Hero Image Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: "url(/static/ad/robot.png)",
          height: "55%",
        }}
      />

      {/* Gradient overlay for hero to info transition */}
      <div
        className="absolute"
        style={{
          top: "52%",
          left: 0,
          right: 0,
          height: "8%",
          background: "linear-gradient(to bottom, transparent, #1a1a28 100%)",
        }}
      />

      {/* Rainbow gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#ff1744] via-[#ffd700] to-[#00e676]" />

      {/* Info Panel Layer */}
      <div
        className="absolute bottom-0 left-0 right-0 rounded-b-2xl flex flex-col"
        style={{
          height: "48%",
          backgroundColor: "#1a1a28",
          padding: "16px",
        }}
      >
        <p
          style={{
            fontSize: "10px",
            letterSpacing: "0.15em",
            color: "#9ca3af",
            marginBottom: "6px",
            textTransform: "uppercase",
          }}
        >
          Sponsored
        </p>
        <p
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "1.4rem",
            letterSpacing: "-0.02em",
            background: "linear-gradient(90deg, #ffffff 0%, #a78bfa 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Really Cool AI Startup Ad
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#9ca3af",
            fontStyle: "italic",
            marginTop: "6px",
          }}
        >
          Swipe to skip · This could be your startup
        </p>
      </div>
    </motion.div>
  );
}
