import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { setAuthToken } from "../api/client";

export function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    if (token) {
      setAuthToken(token);
      navigate("/swipe");
    } else {
      navigate("/");
    }
  }, [navigate, searchParams]);

  return null;
}
