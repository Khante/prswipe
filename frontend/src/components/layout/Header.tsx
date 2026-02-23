import { useNavigate } from "react-router-dom";
import { GitBranch, LogOut } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-border-subtle">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-merge to-accent-close flex items-center justify-center">
            <GitBranch className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold text-text-primary">
            PRswipe
          </h1>
        </button>

        {user && (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <img
                src={user.avatar_url}
                alt={user.login}
                className="w-8 h-8 rounded-full border-2 border-border-subtle"
              />
              <span className="font-body text-sm text-text-secondary hidden sm:inline">
                {user.name || user.login}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-bg-secondary transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5 text-text-secondary" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
