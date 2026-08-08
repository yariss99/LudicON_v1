/**
 * AI Copilot — contextual platform assistant (not a chatbot).
 * Feature 011: proactive pedagogical suggestions via SuggestionEngine;
 * chat/quick-actions remain an advanced assist surface.
 */

export type CopilotPanelMode = "expanded" | "collapsed" | "pinned" | "hidden";

export type CopilotDocumentKind =
  | "project"
  | "lesson"
  | "worksheet"
  | "assessment"
  | "game"
  | "story"
  | "presentation"
  | "resource"
  | "page"
  | "none";

export type CopilotQuickActionId =
  | "generate_ideas"
  | "improve_writing"
  | "differentiate"
  | "simplify"
  | "expand"
  | "create_activities"
  | "create_assessment"
  | "suggest_homework"
  | "generate_reflection"
  | "generate_resources"
  | "translate"
  | "summarize";

export type CopilotMessageRole = "user" | "assistant" | "system";

export type CopilotResponseAction =
  | "insert"
  | "copy"
  | "replace"
  | "append"
  | "save_note";

export type CopilotRuntimeContext = {
  projectId: string | null;
  projectName: string | null;
  lessonId: string | null;
  lessonTitle: string | null;
  documentKind: CopilotDocumentKind;
  documentTitle: string | null;
  subject: string | null;
  grade: string | null;
  curriculum: string | null;
  competencies: readonly string[];
  selection: string | null;
  route: string;
  activity: string;
};

export type CopilotMessage = {
  id: string;
  role: CopilotMessageRole;
  content: string;
  createdAt: string;
  actionId?: CopilotQuickActionId;
  promptLabel?: string;
};

export type CopilotConversation = {
  id: string;
  projectId: string | null;
  projectName: string;
  title: string;
  messages: CopilotMessage[];
  createdAt: string;
  updatedAt: string;
};

export type CopilotPrompt = {
  id: string;
  label: string;
  text: string;
  pinned: boolean;
  lastUsedAt: string;
  useCount: number;
};

export type CopilotNote = {
  id: string;
  projectId: string | null;
  content: string;
  createdAt: string;
};

export type CommandId =
  | "ask_ai"
  | "create_lesson"
  | "create_worksheet"
  | "search"
  | "open_project"
  | "settings";

export type CommandItem = {
  id: CommandId;
  label: string;
  hint: string;
  keywords: string[];
};
