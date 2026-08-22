import { createContext, useContext } from "react";
import type {
  AuthStatus,
  AuthUser,
  PasswordRecoveryResult,
  SignUpInput,
} from "./types";

export type AuthContextValue = {
  readonly status: AuthStatus;
  readonly user: AuthUser | null;
  readonly signIn: (email: string, password: string) => Promise<AuthUser>;
  readonly signUp: (input: SignUpInput) => Promise<AuthUser>;
  readonly signOut: () => Promise<void>;
  readonly requestPasswordRecovery: (
    email: string,
  ) => Promise<PasswordRecoveryResult>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return value;
}
