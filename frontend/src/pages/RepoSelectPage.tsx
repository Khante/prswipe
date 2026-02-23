import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, Loader2 } from "lucide-react";
import { PageWrapper } from "../components/layout/PageWrapper";
import { Header } from "../components/layout/Header";
import { RepoCard } from "../components/repo/RepoCard";
import { getRepos, Repo } from "../api/repos";
import { usePRStore } from "../store/prStore";

export function RepoSelectPage() {
  const navigate = useNavigate();
  const { loadPRs, setRepo } = usePRStore();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const data = await getRepos();
        setRepos(data);
      } catch (err) {
        setError("Failed to load repositories");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRepos();
  }, []);

  const filteredRepos = repos.filter(
    (repo) =>
      repo.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      repo.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleRepoClick = async (repo: Repo) => {
    setRepo(repo.full_name);
    await loadPRs(repo.full_name);
    navigate(`/swipe/${repo.owner_login}/${repo.name}`);
  };

  return (
    <PageWrapper>
      <Header />
      <main className="pt-24 pb-12 px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h2 className="font-display text-3xl font-bold text-text-primary mb-2">
            Select Repository
          </h2>
          <p className="font-body text-text-secondary">
            Choose a repository to start reviewing PRs
          </p>
        </div>

        <div className="relative mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary" />
          <input
            type="text"
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-bg-card border border-border-subtle rounded-xl font-body text-text-primary placeholder-text-secondary focus:outline-none focus:border-accent-gold transition-colors"
          />
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent-gold animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20">
            <p className="font-body text-accent-close">{error}</p>
          </div>
        ) : filteredRepos.length === 0 ? (
          <div className="text-center py-20">
            <p className="font-body text-text-secondary">
              {searchQuery
                ? "No repositories match your search"
                : "No repositories found"}
            </p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredRepos.map((repo, index) => (
              <motion.div
                key={repo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <RepoCard repo={repo} onClick={() => handleRepoClick(repo)} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </PageWrapper>
  );
}
