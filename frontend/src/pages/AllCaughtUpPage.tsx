import { motion } from "framer-motion";
import { CheckCircle2, XCircle, GitPullRequest } from "lucide-react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Header } from "../components/layout/Header";
import { usePRStore } from "../store/prStore";

export function AllCaughtUpPage() {
  const { mergedCount, closedCount, reviewedCount } = usePRStore();

  return (
    <PageWrapper>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="w-24 h-24 mx-auto mb-6 rounded-full bg-accent-merge/20 flex items-center justify-center"
          >
            <CheckCircle2 className="w-12 h-12 text-accent-merge" />
          </motion.div>

          <h1 className="font-display text-3xl font-bold text-text-primary mb-2">
            You're all caught up!
          </h1>
          <p className="font-body text-text-secondary mb-8">
            Great job reviewing all the PRs.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-xl p-4"
            >
              <GitPullRequest className="w-6 h-6 mx-auto mb-2 text-accent-gold" />
              <div className="font-mono text-2xl font-bold text-text-primary">
                {reviewedCount}
              </div>
              <div className="font-body text-xs text-text-secondary">Total</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="glass-card rounded-xl p-4"
            >
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2 text-accent-merge" />
              <div className="font-mono text-2xl font-bold text-accent-merge">
                {mergedCount}
              </div>
              <div className="font-body text-xs text-text-secondary">
                Merged
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="glass-card rounded-xl p-4"
            >
              <XCircle className="w-6 h-6 mx-auto mb-2 text-accent-close" />
              <div className="font-mono text-2xl font-bold text-accent-close">
                {closedCount}
              </div>
              <div className="font-body text-xs text-text-secondary">
                Closed
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </PageWrapper>
  );
}
