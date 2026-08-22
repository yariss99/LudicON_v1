import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import { createAuthProvider } from "./services/authProvider";
import type { AuthStatus, AuthUser, SignUpInput } from "./types";

const provider = createAuthProvider();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("resolving");
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    provider
      .restoreSession()
      .then((restored) => {
        if (cancelled) return;
        setUser(restored);
        setStatus(restored ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (cancelled) return;
        setUser(null);
        setStatus("anonymous");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const next = await provider.signIn(email, password);
    setUser(next);
    setStatus("authenticated");
    return next;
  }, []);

  const signUp = useCallback(async (input: SignUpInput) => {
    const next = await provider.signUp(input);
    setUser(next);
    setStatus("authenticated");
    return next;
  }, []);

  const signOut = useCallback(async () => {
    await provider.signOut();
    setUser(null);
    setStatus("anonymous");
  }, []);

  const requestPasswordRecovery = useCallback(async (email: string) => {
    return provider.requestPasswordRecovery(email);
  }, []);

  const value = useMemo(
    () => ({ status, user, signIn, signUp, signOut, requestPasswordRecovery }),
    [status, user, signIn, signUp, signOut, requestPasswordRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
