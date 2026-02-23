import { motion } from "framer-motion";
import { X, Check } from "lucide-react";

interface ActionButtonsProps {
  onClose: () => void;
  onMerge: () => void;
  isLoading?: boolean;
}

export function ActionButtons({
  onClose,
  onMerge,
  isLoading,
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-10">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClose}
        disabled={isLoading}
        className="w-24 h-24 rounded-full bg-accent-close/20 border-4 border-accent-close/50 flex items-center justify-center hover:bg-accent-close/30 hover:shadow-glow-close transition-all disabled:opacity-50"
      >
        <X className="w-12 h-12 text-accent-close" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={onMerge}
        disabled={isLoading}
        className="w-24 h-24 rounded-full bg-accent-merge/20 border-4 border-accent-merge/50 flex items-center justify-center hover:bg-accent-merge/30 hover:shadow-glow-merge transition-all disabled:opacity-50"
      >
        <Check className="w-12 h-12 text-accent-merge" />
      </motion.button>
    </div>
  );
}
