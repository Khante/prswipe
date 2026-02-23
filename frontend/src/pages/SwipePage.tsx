import { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Header } from "../components/layout/Header";
import { PRCardStack } from "../components/cards/PRCardStack";
import { LoadingCard } from "../components/ui/LoadingCard";
import { usePRStore } from "../store/prStore";

export function SwipePage() {
  const navigate = useNavigate();
  const {
    prQueue,
    isLoading,
    error,
    currentRepo,
    reviewedCount,
    loadAllPRs,
    swipeLeft,
    swipeRight,
    clearError,
    undo,
    history,
  } = usePRStore();

  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const currentPRRef = useRef(prQueue[0]);

  useEffect(() => {
    currentPRRef.current = prQueue[0];
  }, [prQueue]);

  useEffect(() => {
    if (!currentRepo) {
      loadAllPRs();
    }
  }, [currentRepo, loadAllPRs]);

  const totalPRs = prQueue.length + reviewedCount;
  const currentPR = prQueue[0];

  const hasAttemptedLoad = currentRepo !== null || reviewedCount > 0;

  useEffect(() => {
    if (!isLoading && hasAttemptedLoad && prQueue.length === 0) {
      navigate("/done", { replace: true });
    }
  }, [prQueue.length, reviewedCount, isLoading, navigate, hasAttemptedLoad]);

  useEffect(() => {
    if (error && !isLoading) {
      navigate("/done", { replace: true });
    }
  }, [error, isLoading, navigate]);

  const handleSwipeLeft = useCallback(() => {
    if (!currentPRRef.current || isAnimating) return;
    setIsAnimating(true);
  }, [isAnimating]);

  const handleSwipeRight = useCallback(() => {
    if (!currentPRRef.current || isAnimating) return;
    setIsAnimating(true);
  }, [isAnimating]);

  const handleAnimationComplete = useCallback(
    (direction: "left" | "right") => {
      const pr = currentPRRef.current;
      if (!pr) return;

      if (direction === "left") {
        swipeLeft(pr);
      } else {
        swipeRight(pr);
      }
      setIsAnimating(false);
    },
    [swipeLeft, swipeRight],
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isAnimating) return;

      if (e.key === "ArrowRight" || e.key === "l" || e.key === "L") {
        handleSwipeRight();
      } else if (e.key === "ArrowLeft" || e.key === "h" || e.key === "H") {
        handleSwipeLeft();
      } else if (e.key === "u" || e.key === "U") {
        undo();
      } else if (e.key === "o" || e.key === "O") {
        if (currentPR) {
          window.open(currentPR.html_url, "_blank");
        }
      } else if (e.key === "?") {
        setShowShortcuts((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    handleSwipeLeft,
    handleSwipeRight,
    undo,
    history,
    currentPR,
    clearError,
    isAnimating,
  ]);

  if (isLoading) {
    return (
      <PageWrapper>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingCard />
        </div>
      </PageWrapper>
    );
  }

  if (!currentPR) {
    return (
      <PageWrapper>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <LoadingCard />
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <Header />
      <main className="pt-24 pb-12 px-4">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="font-body text-sm text-text-secondary">
              {reviewedCount} / {totalPRs} reviewed
            </div>
          </div>

          <div className="mb-6">
            <div className="h-1.5 bg-bg-secondary rounded-full overflow-hidden border border-border-subtle">
              <motion.div
                className="h-full bg-accent-merge"
                initial={{ width: 0 }}
                animate={{
                  width:
                    totalPRs > 0
                      ? `${(reviewedCount / totalPRs) * 100}%`
                      : "0%",
                }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>

          <PRCardStack
            prs={prQueue}
            onAnimationComplete={handleAnimationComplete}
          />

          <p className="text-center mt-6 font-body text-xs text-text-secondary">
            Press ← to close, → to merge
          </p>

          <AnimatePresence>
            {showShortcuts && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                onClick={() => setShowShortcuts(false)}
              >
                <div
                  className="bg-bg-card p-6 rounded-xl border border-border-subtle max-w-sm"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="font-display text-lg font-semibold text-text-primary mb-4">
                    Keyboard Shortcuts
                  </h3>
                  <div className="space-y-2 font-body text-sm">
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Merge</span>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-accent-merge">
                        →
                      </kbd>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-accent-merge ml-1">
                        l
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Close</span>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-accent-close">
                        ←
                      </kbd>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-accent-close ml-1">
                        h
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Undo</span>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-text-primary">
                        u
                      </kbd>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-text-secondary">Open PR</span>
                      <kbd className="px-2 py-1 bg-bg-secondary rounded text-accent-gold">
                        o
                      </kbd>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowShortcuts(false)}
                    className="mt-4 w-full btn-primary btn-github"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </PageWrapper>
  );
}
