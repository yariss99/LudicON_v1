import type { ReactNode } from "react";
import { useAuth } from "../AuthContext";
import "../styles/auth.css";
import { AuthMark } from "./AuthMark";

export function AuthSplash() {
  return (
    <div className="lx-auth-splash" role="status" aria-live="polite">
      <AuthMark />
      <p>Se deschide atelierul…</p>
    </div>
  );
}

export function AuthReady({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "resolving") return <AuthSplash />;
  return children;
}
