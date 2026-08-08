import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { COPILOT_STORAGE } from "../constants";
import type { SuggestionState } from "../suggestionTypes";

const STORAGE_KEY = COPILOT_STORAGE.suggestions;
const SESSION_KEY = "prima.ai-copilot.suggestion-session.v1";

type PersistedBlob = {
  sessions: Record<
    string,
    {
      dismissedIds: string[];
      updatedAt: string;
    }
  >;
};

function readBlob(): PersistedBlob {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: {} };
    const parsed = JSON.parse(raw) as PersistedBlob;
    return parsed?.sessions ? parsed : { sessions: {} };
  } catch {
    return { sessions: {} };
  }
}

function writeBlob(blob: PersistedBlob) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // Private mode / quota — in-memory dismiss still works for the tab.
  }
}

function getSessionId(): string {
  try {
    const existing = sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const id = createId("copses");
    sessionStorage.setItem(SESSION_KEY, id);
    return id;
  } catch {
    return "ephemeral";
  }
}

/**
 * Suggestion state in LocalStorage, scoped so dismissed cards
 * do not reappear during the same browser session.
 */
export const suggestionStateStore = {
  getSessionId,

  load(): SuggestionState {
    const sessionId = getSessionId();
    const blob = readBlob();
    const entry = blob.sessions[sessionId];
    return {
      sessionId,
      dismissedIds: entry?.dismissedIds ?? [],
      updatedAt: entry?.updatedAt ?? nowIso(),
    };
  },

  dismiss(suggestionId: string): SuggestionState {
    const sessionId = getSessionId();
    const blob = readBlob();
    const prev = blob.sessions[sessionId]?.dismissedIds ?? [];
    const dismissedIds = prev.includes(suggestionId)
      ? prev
      : [...prev, suggestionId];
    const updatedAt = nowIso();
    blob.sessions[sessionId] = { dismissedIds, updatedAt };
    // Prune old sessions (keep last 8)
    const keys = Object.keys(blob.sessions);
    if (keys.length > 8) {
      for (const key of keys.slice(0, keys.length - 8)) {
        if (key !== sessionId) delete blob.sessions[key];
      }
    }
    writeBlob(blob);
    return { sessionId, dismissedIds, updatedAt };
  },

  isDismissed(suggestionId: string): boolean {
    return this.load().dismissedIds.includes(suggestionId);
  },
};
