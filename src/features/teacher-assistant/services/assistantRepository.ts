import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  AssistantConversation,
  AssistantConversationScope,
  AssistantMessage,
  TeacherMemoryProfile,
} from "../types";

const CONV_KEY = "prima.teacher-assistant.conversations.v1";
const MEMORY_KEY = "prima.teacher-assistant.memory.v1";
const ACTIVE_KEY = "prima.teacher-assistant.active.v1";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createEmptyConversation(input: {
  title?: string;
  scope?: AssistantConversationScope;
  projectId?: string;
  lessonId?: string;
  documentId?: string;
}): AssistantConversation {
  const now = nowIso();
  return {
    id: createId("tach"),
    title: input.title?.trim() || "Conversație PRIMA",
    scope: input.scope ?? (input.projectId ? "project" : "global"),
    projectId: input.projectId,
    lessonId: input.lessonId,
    documentId: input.documentId,
    pinned: false,
    archived: false,
    messages: [],
    createdAt: now,
    updatedAt: now,
    createdBy: "teacher",
  };
}

export const assistantRepository = {
  listConversations(): AssistantConversation[] {
    return load<AssistantConversation[]>(CONV_KEY, [])
      .filter((c) => !c.archived)
      .sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
      });
  },

  listAll(): AssistantConversation[] {
    return load<AssistantConversation[]>(CONV_KEY, []).sort(
      (a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt),
    );
  },

  getConversation(id: string): AssistantConversation | undefined {
    return load<AssistantConversation[]>(CONV_KEY, []).find((c) => c.id === id);
  },

  getActiveId(): string | null {
    return load<string | null>(ACTIVE_KEY, null);
  },

  setActiveId(id: string | null): void {
    save(ACTIVE_KEY, id);
  },

  saveConversation(conversation: AssistantConversation): AssistantConversation {
    const all = load<AssistantConversation[]>(CONV_KEY, []);
    const next = { ...conversation, updatedAt: nowIso() };
    const idx = all.findIndex((c) => c.id === next.id);
    if (idx >= 0) all[idx] = next;
    else all.unshift(next);
    save(CONV_KEY, all.slice(0, 200));
    return next;
  },

  createConversation(input: {
    title?: string;
    scope?: AssistantConversationScope;
    projectId?: string;
    lessonId?: string;
    documentId?: string;
  }): AssistantConversation {
    const conversation = createEmptyConversation(input);
    this.saveConversation(conversation);
    this.setActiveId(conversation.id);
    return conversation;
  },

  appendMessage(
    conversationId: string,
    message: AssistantMessage,
  ): AssistantConversation {
    const existing = this.getConversation(conversationId);
    if (!existing) throw new Error(`Conversation not found: ${conversationId}`);
    const title =
      existing.messages.length === 0 && message.role === "teacher"
        ? message.content.slice(0, 48) || existing.title
        : existing.title;
    return this.saveConversation({
      ...existing,
      title,
      messages: [...existing.messages, message],
    });
  },

  updateSummary(
    conversationId: string,
    summary: string,
  ): AssistantConversation {
    const existing = this.getConversation(conversationId);
    if (!existing) throw new Error(`Conversation not found: ${conversationId}`);
    return this.saveConversation({ ...existing, summary });
  },

  pin(conversationId: string, pinned = true): AssistantConversation {
    const existing = this.getConversation(conversationId);
    if (!existing) throw new Error(`Conversation not found: ${conversationId}`);
    return this.saveConversation({ ...existing, pinned });
  },

  archive(conversationId: string): AssistantConversation {
    const existing = this.getConversation(conversationId);
    if (!existing) throw new Error(`Conversation not found: ${conversationId}`);
    const archived = this.saveConversation({ ...existing, archived: true });
    if (this.getActiveId() === conversationId) this.setActiveId(null);
    return archived;
  },

  searchConversations(query: string): AssistantConversation[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.listConversations();
    return this.listConversations().filter((c) => {
      if (c.title.toLowerCase().includes(q)) return true;
      if (c.summary?.toLowerCase().includes(q)) return true;
      return c.messages.some((m) => m.content.toLowerCase().includes(q));
    });
  },

  getMemory(teacherId: string): TeacherMemoryProfile {
    const all = load<Record<string, TeacherMemoryProfile>>(MEMORY_KEY, {});
    return (
      all[teacherId] ?? {
        teacherId,
        styleNotes: ["Calm, clar, orientat pe clasă"],
        preferredFormats: ["fișă scurtă", "activitate colaborativă"],
        favoriteResourceIds: [],
        feedbackNotes: [],
        frequentWorkflows: ["planificare → generare → validare"],
        projectHistory: [],
        updatedAt: nowIso(),
      }
    );
  },

  saveMemory(profile: TeacherMemoryProfile): TeacherMemoryProfile {
    const all = load<Record<string, TeacherMemoryProfile>>(MEMORY_KEY, {});
    const next = { ...profile, updatedAt: nowIso() };
    all[profile.teacherId] = next;
    save(MEMORY_KEY, all);
    return next;
  },

  rememberPreference(
    teacherId: string,
    kind:
      | "style"
      | "format"
      | "feedback"
      | "workflow"
      | "favorite"
      | "project",
    value: string,
  ): TeacherMemoryProfile {
    const mem = this.getMemory(teacherId);
    const push = (list: readonly string[], item: string) =>
      Array.from(new Set([...list, item])).slice(-20);
    let next = mem;
    if (kind === "style")
      next = { ...mem, styleNotes: push(mem.styleNotes, value) };
    if (kind === "format")
      next = { ...mem, preferredFormats: push(mem.preferredFormats, value) };
    if (kind === "feedback")
      next = { ...mem, feedbackNotes: push(mem.feedbackNotes, value) };
    if (kind === "workflow")
      next = {
        ...mem,
        frequentWorkflows: push(mem.frequentWorkflows, value),
      };
    if (kind === "favorite")
      next = {
        ...mem,
        favoriteResourceIds: push(mem.favoriteResourceIds, value),
      };
    if (kind === "project")
      next = { ...mem, projectHistory: push(mem.projectHistory, value) };
    return this.saveMemory(next);
  },
};
