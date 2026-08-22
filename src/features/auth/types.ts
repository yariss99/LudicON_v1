/**
 * Public teacher identity established by authentication.
 * Profile expansion (avatar, school, subscription) belongs later.
 */
export type AuthUser = {
  readonly id: string;
  readonly displayName: string;
  readonly email: string;
};

export type AuthStatus = "resolving" | "authenticated" | "anonymous";

export type SignUpInput = {
  readonly displayName: string;
  readonly email: string;
  readonly password: string;
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "email_taken"
  | "weak_password"
  | "unknown";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

/**
 * Recovery never reveals whether the address exists.
 * `channel` tells the UI whether a real mail provider ran.
 */
export type PasswordRecoveryChannel = "email" | "unavailable";

export type PasswordRecoveryResult = {
  readonly accepted: true;
  readonly channel: PasswordRecoveryChannel;
};

/** Isolated port — swap the adapter without touching UI or routes. */
export type AuthProviderPort = {
  restoreSession(): Promise<AuthUser | null>;
  signIn(email: string, password: string): Promise<AuthUser>;
  signUp(input: SignUpInput): Promise<AuthUser>;
  signOut(): Promise<void>;
  requestPasswordRecovery(email: string): Promise<PasswordRecoveryResult>;
};
