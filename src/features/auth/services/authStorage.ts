import { normalizeEmail } from "./credentials";

/**
 * Authentication records live on their own keys, separate from
 * `prima.projects.*` and other local development data.
 */
export const IDENTITY_STORAGE_KEY = "ludicon.auth.identities.v1";
export const SESSION_STORAGE_KEY = "ludicon.auth.session.v1";

export const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

export class AuthStorageError extends Error {
  constructor(message = "AUTH_STORAGE_UNAVAILABLE") {
    super(message);
    this.name = "AuthStorageError";
  }
}

export type StoredIdentity = {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly passwordSalt: string;
  readonly passwordHash: string;
  readonly createdAt: string;
};

export type StoredSession = {
  readonly token: string;
  readonly userId: string;
  readonly expiresAt: string;
};

function canStore(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function requireStore(): void {
  if (!canStore()) {
    throw new AuthStorageError();
  }
}

function persist(key: string, serialized: string): void {
  requireStore();
  try {
    localStorage.setItem(key, serialized);
  } catch {
    throw new AuthStorageError("AUTH_STORAGE_WRITE_FAILED");
  }
  if (localStorage.getItem(key) !== serialized) {
    throw new AuthStorageError("AUTH_STORAGE_VERIFY_FAILED");
  }
}

export function loadIdentities(): StoredIdentity[] {
  if (!canStore()) return [];
  try {
    const raw = localStorage.getItem(IDENTITY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isIdentity).map((row) => ({
      ...row,
      email: normalizeEmail(row.email),
    }));
  } catch {
    return [];
  }
}

export function saveIdentities(identities: readonly StoredIdentity[]): void {
  persist(IDENTITY_STORAGE_KEY, JSON.stringify(identities));
}

export function loadSession(): StoredSession | null {
  if (!canStore()) return null;
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isSession(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveSession(session: StoredSession): void {
  persist(SESSION_STORAGE_KEY, JSON.stringify(session));
}

export function clearSession(): void {
  if (!canStore()) return;
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

function isIdentity(value: unknown): value is StoredIdentity {
  if (!value || typeof value !== "object") return false;
  const row = value as StoredIdentity;
  return (
    typeof row.id === "string" &&
    typeof row.email === "string" &&
    typeof row.displayName === "string" &&
    typeof row.passwordSalt === "string" &&
    typeof row.passwordHash === "string" &&
    typeof row.createdAt === "string"
  );
}

function isSession(value: unknown): value is StoredSession {
  if (!value || typeof value !== "object") return false;
  const row = value as StoredSession;
  return (
    typeof row.token === "string" &&
    typeof row.userId === "string" &&
    typeof row.expiresAt === "string"
  );
}
