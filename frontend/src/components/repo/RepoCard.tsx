import { motion } from "framer-motion";
import { Star, GitPullRequest, Lock } from "lucide-react";
import { Repo } from "../../api/repos";

interface RepoCardProps {
  repo: Repo;
  onClick: () => void;
}

const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  Python: "#3572A5",
  Java: "#b07219",
  Go: "#00ADD8",
  Rust: "#dea584",
  Ruby: "#701516",
  PHP: "#4F5D95",
  "C++": "#f34b7d",
  C: "#555555",
  Swift: "#F05138",
  Kotlin: "#A97BFF",
  Shell: "#89e051",
};

export function RepoCard({ repo, onClick }: RepoCardProps) {
  const languageColor = repo.language
    ? languageColors[repo.language] || "#8b949e"
    : "#8b949e";

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass-card rounded-xl p-5 text-left w-full group cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={repo.owner_avatar_url}
            alt={repo.owner_login}
            className="w-8 h-8 rounded-full"
          />
          <div>
            <h3 className="font-display font-semibold text-text-primary group-hover:text-accent-gold transition-colors">
              {repo.name}
            </h3>
            <p className="font-body text-xs text-text-secondary">
              {repo.owner_login}
            </p>
          </div>
        </div>
        {repo.private && <Lock className="w-4 h-4 text-text-secondary" />}
      </div>

      {repo.description && (
        <p className="font-body text-sm text-text-secondary mb-4 line-clamp-2">
          {repo.description}
        </p>
      )}

      <div className="flex items-center gap-4 text-xs font-body">
        {repo.language && (
          <div className="flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: languageColor }}
            />
            <span className="text-text-secondary">{repo.language}</span>
          </div>
        )}
        <div className="flex items-center gap-1 text-text-secondary">
          <Star className="w-3.5 h-3.5" />
          {repo.stargazers_count}
        </div>
        <div className="flex items-center gap-1 text-text-secondary">
          <GitPullRequest className="w-3.5 h-3.5" />
          {repo.open_prs_count}
        </div>
      </div>
    </motion.button>
  );
}
