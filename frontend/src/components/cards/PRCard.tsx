import {
  motion,
  useTransform,
  useMotionValue,
  PanInfo,
  useAnimationControls,
} from "framer-motion";
import {
  GitPullRequest,
  Plus,
  Minus,
  FileCode,
  Info,
  ExternalLink,
} from "lucide-react";
import { PR } from "../../api/prs";
import { SwipeOverlay } from "./SwipeOverlay";

interface PRCardProps {
  pr: PR;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isTopCard?: boolean;
}

const SWIPE_THRESHOLD = 140;

export function PRCard({
  pr,
  onSwipeLeft,
  onSwipeRight,
  isTopCard = false,
}: PRCardProps) {
  const dragX = useMotionValue(0);

  // Tinder cards rotate and slide simultaneously
  const rotate = useTransform(dragX, [-200, 0, 200], [-25, 0, 25]);
  const opacity = useTransform(
    dragX,
    [-400, -300, 0, 300, 400],
    [0, 1, 1, 1, 0],
  );

  const controls = useAnimationControls();

  const {
    author,
    stats,
    generated_bio,
    compatibility_score,
    html_url,
    number,
    repo,
  } = pr;

  const handleDragEnd = (_: any, info: PanInfo) => {
    if (!isTopCard) return;

    const offset = info.offset.x;
    const velocity = info.velocity.x;

    if (offset > SWIPE_THRESHOLD || velocity > 500) {
      onSwipeRight();
    } else if (offset < -SWIPE_THRESHOLD || velocity < -500) {
      onSwipeLeft();
    } else {
      // Snappy return to center
      controls.start({
        x: 0,
        rotate: 0,
        transition: { type: "spring", stiffness: 500, damping: 30 },
      });
    }
  };

  return (
    <motion.div
      drag={isTopCard ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={1}
      onDragEnd={handleDragEnd}
      animate={controls}
      style={{
        x: dragX,
        rotate,
        opacity,
        // Tinder cards rotate from the bottom
        transformOrigin: "bottom center",
      }}
      whileDrag={{ scale: 1.02, cursor: "grabbing" }}
      className={`absolute inset-0 w-full max-w-md h-[600px] rounded-2xl overflow-hidden bg-slate-900 shadow-2xl select-none ${
        isTopCard ? "z-50" : "z-0"
      }`}
    >
      {/* 1. Immersive Background Image */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={author.avatar_url}
          alt={author.login}
          className="w-full h-full object-cover pointer-events-none"
        />
        {/* The Tinder Gradient - Essential for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[#1a1a28] opacity-90" />
      </div>

      {/* 2. Swipe Feedback Overlay (Passes dragX to show 'LIKE'/'NOPE' stamps) */}
      {isTopCard && <SwipeOverlay x={dragX} />}

      {/* 3. Content Overlay (Bottom Anchored) */}
      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col gap-3 pointer-events-none">
        {/* Name, Age, and Info Button */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <h3 className="text-3xl font-bold text-white tracking-tight">
              {author.name || author.login}
            </h3>
            <span className="text-2xl text-white/90 font-light">
              {stats.age_days}
            </span>
          </div>
          <button className="p-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20">
            <Info className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* PR Info Badge */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 backdrop-blur-md rounded-full border border-white/10 w-fit">
          <GitPullRequest className="w-4 h-4 text-[#ffd700]" />
          <span className="font-mono text-xs text-white">
            #{number} · {repo}
          </span>
        </div>

        {/* Bio - Italicized and limited */}
        <p className="text-white/80 text-sm line-clamp-2 italic leading-snug">
          "{generated_bio}"
        </p>

        {/* Stats Grid */}
        <div className="flex items-center gap-4 py-2">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-[#00e676]/20 rounded">
              <Plus className="w-3 h-3 text-[#00e676]" />
            </div>
            <span className="text-[#00e676] font-mono text-sm">
              +{stats.additions}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-[#ff1744]/20 rounded">
              <Minus className="w-3 h-3 text-[#ff1744]" />
            </div>
            <span className="text-[#ff1744] font-mono text-sm">
              -{stats.deletions}
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <FileCode className="w-4 h-4" />
            <span className="font-mono text-sm">{stats.changed_files}</span>
          </div>
        </div>

        {/* Compatibility Bar */}
        <div className="space-y-1.5">
          <div className="flex justify-between text-[10px] font-bold text-white/50 uppercase tracking-widest">
            <span>Match Score</span>
            <span className="text-[#00e676]">{compatibility_score}%</span>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${compatibility_score}%` }}
              className="h-full bg-gradient-to-r from-pink-500 to-[#00e676]"
            />
          </div>
        </div>

        {/* GitHub Link (Interactive part) */}
        <a
          href={html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto mt-2 flex items-center justify-center gap-2 py-2 rounded-xl bg-white text-black font-bold text-sm hover:bg-gray-200 transition-colors"
        >
          Review Pull Request <ExternalLink className="w-4 h-4" />
        </a>
      </div>
    </motion.div>
  );
}
