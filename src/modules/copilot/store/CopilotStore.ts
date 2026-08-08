import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type { CopilotPersistedState } from "../types";

const STORAGE_KEY = "prima.copilot.suggestions.v1";
const SESSION_KEY = "prima.copilot.session.v1";

type Blob = {
  sessions: Record<
    string,
    {
      dismissedIds: string[];
      updatedAt: string;
    }
  >;
};

function readBlob(): Blob {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { sessions: {} };
    const parsed = JSON.parse(raw) as Blob;
    return parsed?.sessions ? parsed : { sessions: {} };
  } catch {
    return { sessions: {} };
  }
}

function writeBlob(blob: Blob) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(blob));
  } catch {
    // quota / private mode — session dismiss still works in memory
  }
}

function resolveSessionId(): string {
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
 * CopilotStore — LocalStorage persistence for dismissed suggestions.
 * Dismissals are scoped to the current browser session.
 */
export const CopilotStore = {
  load(): CopilotPersistedState {
    const sessionId = resolveSessionId();
    const entry = readBlob().sessions[sessionId];
    return {
      sessionId,
      dismissedIds: entry?.dismissedIds ?? [],
      updatedAt: entry?.updatedAt ?? nowIso(),
    };
  },

  dismiss(suggestionId: string): CopilotPersistedState {
    const sessionId = resolveSessionId();
    const blob = readBlob();
    const prev = blob.sessions[sessionId]?.dismissedIds ?? [];
    const dismissedIds = prev.includes(suggestionId)
      ? prev
      : [...prev, suggestionId];
    const updatedAt = nowIso();
    blob.sessions[sessionId] = { dismissedIds, updatedAt };

    const keys = Object.keys(blob.sessions);
    if (keys.length > 10) {
      for (const key of keys.slice(0, keys.length - 10)) {
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
