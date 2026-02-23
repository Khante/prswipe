import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "./pages/LoginPage";
import { AuthPage } from "./pages/AuthPage";
import { SwipePage } from "./pages/SwipePage";
import { AllCaughtUpPage } from "./pages/AllCaughtUpPage";
import { useAuthStore } from "./store/authStore";
import { usePRStore } from "./store/prStore";
import { ErrorToast } from "./components/ui/ErrorToast";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser } = useAuthStore();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      await fetchUser();
      setChecked(true);
    };
    checkAuth();
  }, [fetchUser]);

  if (isLoading || !checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-accent-gold border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

function App() {
  const { error, clearError } = usePRStore();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/swipe"
          element={
            <ProtectedRoute>
              <SwipePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/done"
          element={
            <ProtectedRoute>
              <AllCaughtUpPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ErrorToast message={error} onClose={clearError} />
    </BrowserRouter>
  );
}

export default App;
