import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PR } from "../../api/prs";
import { PRCard } from "./PRCard";
import { AdCard } from "./AdCard";

interface PRCardStackProps {
  prs: PR[];
  onAnimationComplete: (direction: "left" | "right") => void;
}

interface RenderItem {
  type: "pr" | "ad";
  key: string;
  data: PR | null;
}

/**
 * HELPER: Decides where to inject ads in the PR stream
 */
function computeAdPositions(prLength: number): number[] {
  if (prLength <= 1) return [];
  const positions: number[] = [];
  const numGroups = Math.ceil(prLength / 10);

  for (let g = 0; g < numGroups; g++) {
    const groupStart = g * 10;
    const groupSize = Math.min(10, prLength - groupStart);
    if (groupSize > 1) {
      const randomOffset = Math.floor(Math.random() * (groupSize - 1)) + 1;
      positions.push(groupStart + randomOffset);
    }
  }
  return positions;
}

/**
 * HELPER: Merges PRs and Ads into a single renderable list
 */
function buildRenderList(prs: PR[], adPositions: number[]): RenderItem[] {
  const list: RenderItem[] = [];
  let adIndex = 0;

  for (let i = 0; i < prs.length; i++) {
    list.push({
      type: "pr",
      key: `pr-${prs[i].repo}-${prs[i].number}`,
      data: prs[i],
    });

    const adPosition = adPositions[adIndex];
    if (adPosition === i + 1) {
      list.push({
        type: "ad",
        key: `ad-${adIndex}`,
        data: null,
      });
      adIndex++;
    }
  }

  return list;
}

export function PRCardStack({ prs, onAnimationComplete }: PRCardStackProps) {
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null,
  );

  const [renderList, setRenderList] = useState<RenderItem[]>(() => {
    return buildRenderList(prs, computeAdPositions(prs.length));
  });

  if (renderList.length === 0) {
    return null;
  }

  // We only render the top 3 cards for a realistic "deck" feel
  const visibleItems = renderList.slice(0, 3);

  const handleSwipe = (direction: "left" | "right") => {
    setSwipeDirection(direction);

    // Removing the item triggers the Framer Motion 'exit' animation
    setRenderList((prev) => prev.slice(1));
    onAnimationComplete(direction);
  };

  const handleAdDismiss = (adKey: string) => {
    setSwipeDirection("left");
    setRenderList((prev) => prev.filter((item) => item.key !== adKey));
  };

  return (
    <div
      className="relative w-full max-w-md mx-auto h-[600px]"
      style={{ perspective: "1200px" }}
    >
      <AnimatePresence mode="popLayout">
        {visibleItems.map((item, index) => {
          const isTopCard = index === 0;

          // These constants define the "Stack" look
          const scale = 1 - index * 0.05; // Cards shrink as they go back
          const yOffset = index * 15; // Cards peek out from the bottom
          const zIndex = 10 - index; // Higher cards are on top

          return (
            <motion.div
              key={item.key}
              layout
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "100%",
                zIndex,
                transformOrigin: "bottom center",
              }}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{
                opacity: 1,
                scale,
                y: yOffset,
                filter: isTopCard ? "blur(0px)" : "blur(1.5px)",
              }}
              exit={{
                x: swipeDirection === "right" ? 600 : -600,
                rotate: swipeDirection === "right" ? 35 : -35,
                opacity: 0,
                transition: { duration: 0.4, ease: "easeOut" },
              }}
              transition={{
                type: "spring",
                stiffness: 260,
                damping: 22,
              }}
            >
              {item.type === "pr" ? (
                <PRCard
                  pr={item.data as PR}
                  isTopCard={isTopCard}
                  onSwipeLeft={() => handleSwipe("left")}
                  onSwipeRight={() => handleSwipe("right")}
                />
              ) : (
                <AdCard
                  isTopCard={isTopCard}
                  onDismiss={() => handleAdDismiss(item.key)}
                />
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
