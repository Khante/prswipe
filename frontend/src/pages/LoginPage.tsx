import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GitBranch, Users, ArrowRight } from "lucide-react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { useAuthStore } from "../store/authStore";
import { getAuthToken } from "../api/client";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      fetchUser();
    } else {
      // No token, stop loading immediately
      useAuthStore.setState({ isLoading: false });
    }
  }, []);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      navigate("/swipe", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return (
      <PageWrapper>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
        </div>
      </PageWrapper>
    );
  }

  const handleLogin = () => {
    window.location.href = "/auth/login";
  };

  const features = [
    { icon: Users, text: "Connect with GitHub" },
    { icon: GitBranch, text: "Pick a repository" },
    { icon: ArrowRight, text: "Swipe to merge or close" },
  ];

  return (
    <PageWrapper>
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-merge via-accent-gold to-accent-close flex items-center justify-center shadow-lg">
              <GitBranch className="w-14 h-14 text-white" />
            </div>
          </div>

          <h1 className="font-display text-5xl font-bold text-text-primary mb-4">
            PRswipe
          </h1>
          <p className="font-body text-xl text-text-secondary mb-8 max-w-md mx-auto">
            When you want to vibe merge those vibe PRs. Swipe right to merge.
            Swipe left to close.
          </p>

          <button
            onClick={handleLogin}
            className="btn-primary btn-github text-lg px-8 py-4 flex items-center gap-3 mx-auto mb-12"
          >
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            Connect with GitHub
          </button>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.text}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex flex-col items-center gap-3 p-4"
              >
                <div className="w-12 h-12 rounded-xl bg-bg-card border border-border-subtle flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-accent-gold" />
                </div>
                <span className="font-body text-sm text-text-secondary">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
