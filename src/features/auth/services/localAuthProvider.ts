import { AuthError, type AuthProviderPort, type AuthUser } from "../types";
import {
  clearSession,
  loadIdentities,
  loadSession,
  saveIdentities,
  saveSession,
  SESSION_TTL_MS,
  type StoredIdentity,
} from "./authStorage";
import {
  hashPassword,
  newSalt,
  newSessionToken,
  newUserId,
  timingSafeEqual,
} from "./crypto";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function toUser(identity: StoredIdentity): AuthUser {
  return {
    id: identity.id,
    displayName: identity.displayName,
    email: identity.email,
  };
}

function isExpired(expiresAt: string): boolean {
  const expires = Date.parse(expiresAt);
  return Number.isNaN(expires) || expires <= Date.now();
}

async function issueSession(identity: StoredIdentity): Promise<AuthUser> {
  saveSession({
    token: newSessionToken(),
    userId: identity.id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  });
  return toUser(identity);
}

/**
 * Local credential provider for this Vite SPA.
 *
 * No hosted auth backend is configured in the repository (no Supabase,
 * Firebase, or API). Credentials are hashed with PBKDF2-SHA-256; the
 * session is a random token with an expiry — never a boolean flag or a
 * bare email. Project data stays on separate `prima.*` keys.
 */
export function createLocalAuthProvider(): AuthProviderPort {
  return {
    async restoreSession() {
      const session = loadSession();
      if (!session || !session.token || isExpired(session.expiresAt)) {
        clearSession();
        return null;
      }
      const identity = loadIdentities().find((row) => row.id === session.userId);
      if (!identity) {
        clearSession();
        return null;
      }
      return toUser(identity);
    },

    async signIn(email, password) {
      const normalized = normalizeEmail(email);
      const identity = loadIdentities().find((row) => row.email === normalized);
      if (!identity) {
        throw new AuthError(
          "invalid_credentials",
          "Emailul sau parola nu sunt corecte.",
        );
      }
      const challenge = await hashPassword(password, identity.passwordSalt);
      if (!timingSafeEqual(challenge, identity.passwordHash)) {
        throw new AuthError(
          "invalid_credentials",
          "Emailul sau parola nu sunt corecte.",
        );
      }
      return issueSession(identity);
    },

    async signUp(input) {
      const normalized = normalizeEmail(input.email);
      const identities = loadIdentities();
      if (identities.some((row) => row.email === normalized)) {
        throw new AuthError(
          "email_taken",
          "Există deja un cont cu acest email.",
        );
      }

      const salt = newSalt();
      const identity: StoredIdentity = {
        id: newUserId(),
        email: normalized,
        displayName: input.displayName.trim(),
        passwordSalt: salt,
        passwordHash: await hashPassword(input.password, salt),
        createdAt: new Date().toISOString(),
      };

      saveIdentities([...identities, identity]);
      return issueSession(identity);
    },

    async signOut() {
      clearSession();
    },

    /**
     * Integration point for a hosted provider's reset-email API.
     * The local adapter accepts any well-formed address and does not
     * look up identities, send mail, or mint reset tokens.
     */
    async requestPasswordRecovery(_email) {
      return { accepted: true as const, channel: "unavailable" as const };
    },
  };
}
