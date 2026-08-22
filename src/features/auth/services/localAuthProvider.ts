import { AuthError, type AuthProviderPort, type AuthUser } from "../types";
import {
  AuthStorageError,
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
import {
  INVALID_CREDENTIALS_MESSAGE,
  normalizeEmail,
} from "./credentials";

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
  try {
    saveSession({
      token: newSessionToken(),
      userId: identity.id,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    });
  } catch (error) {
    if (error instanceof AuthStorageError) {
      throw new AuthError(
        "unknown",
        "Nu am putut deschide sesiunea. Încearcă din nou.",
      );
    }
    throw error;
  }
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
    capabilities() {
      return { passwordRecovery: "unavailable" };
    },

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
      const identity = loadIdentities().find(
        (row) => normalizeEmail(row.email) === normalized,
      );
      if (!identity) {
        throw new AuthError("invalid_credentials", INVALID_CREDENTIALS_MESSAGE);
      }
      const challenge = await hashPassword(password, identity.passwordSalt);
      if (!timingSafeEqual(challenge, identity.passwordHash)) {
        throw new AuthError("invalid_credentials", INVALID_CREDENTIALS_MESSAGE);
      }
      return issueSession(identity);
    },

    async signUp(input) {
      const normalized = normalizeEmail(input.email);
      const identities = loadIdentities();
      if (identities.some((row) => normalizeEmail(row.email) === normalized)) {
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

      try {
        saveIdentities([...identities, identity]);
      } catch (error) {
        if (error instanceof AuthStorageError) {
          throw new AuthError(
            "unknown",
            "Nu am putut salva contul pe acest dispozitiv.",
          );
        }
        throw error;
      }
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
