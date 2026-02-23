import { create } from "zustand";
import { getAllPRs, mergePR, closePR, PR } from "../api/prs";

interface HistoryItem {
  pr: PR;
  action: "merge" | "close";
}

interface PRState {
  currentRepo: string | null;
  prQueue: PR[];
  reviewedCount: number;
  mergedCount: number;
  closedCount: number;
  history: HistoryItem[];
  isLoading: boolean;
  error: string | null;
  setRepo: (repo: string) => void;
  loadPRs: (repo: string) => Promise<void>;
  loadAllPRs: () => Promise<void>;
  swipeRight: (pr: PR) => Promise<void>;
  swipeLeft: (pr: PR) => Promise<void>;
  undo: () => Promise<void>;
  clearError: () => void;
}

export const usePRStore = create<PRState>((set, get) => ({
  currentRepo: null,
  prQueue: [],
  reviewedCount: 0,
  mergedCount: 0,
  closedCount: 0,
  history: [],
  isLoading: false,
  error: null,

  setRepo: (repo: string) => {
    set({ currentRepo: repo });
  },

  loadPRs: async (repo: string) => {
    set({ isLoading: true, error: null });
    try {
      const prs = await getAllPRs();
      set({
        prQueue: prs,
        currentRepo: repo,
        isLoading: false,
        reviewedCount: 0,
        mergedCount: 0,
        closedCount: 0,
        history: [],
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load PRs";
      set({ isLoading: false, error: message });
    }
  },

  loadAllPRs: async () => {
    set({ isLoading: true, error: null });
    try {
      const prs = await getAllPRs();
      set({
        prQueue: prs,
        currentRepo: "all",
        isLoading: false,
        reviewedCount: 0,
        mergedCount: 0,
        closedCount: 0,
        history: [],
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : "Failed to load PRs";
      set({ isLoading: false, error: message });
    }
  },

  swipeRight: async (pr: PR) => {
    // 1. Optimistically remove immediately
    set((state) => ({
      prQueue: state.prQueue.filter(
        (p) => p.number !== pr.number || p.repo !== pr.repo,
      ),
      mergedCount: state.mergedCount + 1,
      reviewedCount: state.reviewedCount + 1,
      history: [...state.history, { pr, action: "merge" }],
    }));

    // 2. Fire API call in background — do NOT await
    try {
      await mergePR(pr.number, { repo: pr.repo });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to merge PR #${pr.number}`;
      set({ error: message });
    }
  },

  swipeLeft: async (pr: PR) => {
    // 1. Optimistically remove immediately
    set((state) => ({
      prQueue: state.prQueue.filter(
        (p) => p.number !== pr.number || p.repo !== pr.repo,
      ),
      closedCount: state.closedCount + 1,
      reviewedCount: state.reviewedCount + 1,
      history: [...state.history, { pr, action: "close" }],
    }));

    // 2. Fire API call in background — do NOT await
    try {
      await closePR(pr.number, { repo: pr.repo });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : `Failed to close PR #${pr.number}`;
      set({ error: message });
    }
  },

  undo: async () => {
    const { history, prQueue } = get();
    if (history.length === 0) return;

    const lastItem = history[history.length - 1];
    if (lastItem.action === "merge") {
      set({ error: "Cannot undo merged PRs" });
      return;
    }

    set({
      prQueue: [lastItem.pr, ...prQueue],
      history: history.slice(0, -1),
      closedCount: get().closedCount - 1,
      reviewedCount: get().reviewedCount - 1,
    });
  },

  clearError: () => {
    set({ error: null });
  },
}));
