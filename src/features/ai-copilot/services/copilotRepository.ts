import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { COPILOT_STORAGE, DEFAULT_SMART_PROMPTS } from "../constants";
import type {
  CopilotConversation,
  CopilotNote,
  CopilotPanelMode,
  CopilotPrompt,
} from "../types";

export type CopilotPrefs = {
  panelMode: CopilotPanelMode;
};

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Feature 011 — never auto-open; teacher opens via FloatingCopilotButton. */
const defaultPrefs: CopilotPrefs = { panelMode: "hidden" };

export const copilotRepository = {
  getPrefs(): CopilotPrefs {
    return { ...defaultPrefs, ...readJson(COPILOT_STORAGE.prefs, {}) };
  },

  setPrefs(prefs: Partial<CopilotPrefs>) {
    writeJson(COPILOT_STORAGE.prefs, { ...this.getPrefs(), ...prefs });
  },

  listConversations(): CopilotConversation[] {
    return readJson<CopilotConversation[]>(COPILOT_STORAGE.conversations, [])
      .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  },

  saveConversation(conversation: CopilotConversation) {
    const list = this.listConversations().filter((c) => c.id !== conversation.id);
    writeJson(COPILOT_STORAGE.conversations, [conversation, ...list].slice(0, 40));
  },

  listPrompts(): CopilotPrompt[] {
    const stored = readJson<CopilotPrompt[]>(COPILOT_STORAGE.prompts, []);
    if (stored.length > 0) return stored;
    const seeded = DEFAULT_SMART_PROMPTS.map((text, index) => ({
      id: createId("prm"),
      label: text,
      text,
      pinned: index < 2,
      lastUsedAt: nowIso(),
      useCount: 0,
    }));
    writeJson(COPILOT_STORAGE.prompts, seeded);
    return seeded;
  },

  touchPrompt(text: string) {
    const list = this.listPrompts();
    const existing = list.find((p) => p.text === text);
    const next: CopilotPrompt = existing
      ? {
          ...existing,
          lastUsedAt: nowIso(),
          useCount: existing.useCount + 1,
        }
      : {
          id: createId("prm"),
          label: text,
          text,
          pinned: false,
          lastUsedAt: nowIso(),
          useCount: 1,
        };
    const others = list.filter((p) => p.id !== next.id);
    writeJson(COPILOT_STORAGE.prompts, [next, ...others].slice(0, 30));
    return next;
  },

  togglePinPrompt(id: string) {
    const list = this.listPrompts().map((p) =>
      p.id === id ? { ...p, pinned: !p.pinned } : p,
    );
    writeJson(COPILOT_STORAGE.prompts, list);
    return list;
  },

  listNotes(): CopilotNote[] {
    return readJson(COPILOT_STORAGE.notes, []);
  },

  saveNote(note: Omit<CopilotNote, "id" | "createdAt"> & { id?: string }) {
    const entry: CopilotNote = {
      id: note.id ?? createId("note"),
      projectId: note.projectId,
      content: note.content,
      createdAt: nowIso(),
    };
    writeJson(COPILOT_STORAGE.notes, [entry, ...this.listNotes()].slice(0, 50));
    return entry;
  },
};
