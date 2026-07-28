import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { EXAMPLE_PROMPTS } from "../constants";
import {
  runAssistantTurn,
  summarizeConversation,
  type OrchestrationPromptPackage,
} from "../services/assistantConversationEngine";
import { buildAssistantContext } from "../services/assistantContextManager";
import { buildProactiveHints } from "../services/assistantProactive";
import { assistantRepository } from "../services/assistantRepository";
import type {
  AssistantContextPackage,
  AssistantConversation,
  AssistantProactiveHint,
  AssistantViewId,
  TeacherMemoryProfile,
} from "../types";

const TEACHER_ID = "teacher-local";
const TEACHER_NAME = "Profesor";

type TeacherAssistantContextValue = {
  readonly context: AssistantContextPackage;
  readonly conversations: readonly AssistantConversation[];
  readonly activeConversation: AssistantConversation | null;
  readonly viewId: AssistantViewId;
  readonly setViewId: (id: AssistantViewId) => void;
  readonly floatingOpen: boolean;
  readonly setFloatingOpen: (open: boolean) => void;
  readonly toggleFloating: () => void;
  readonly historyQuery: string;
  readonly setHistoryQuery: (q: string) => void;
  readonly proactive: readonly AssistantProactiveHint[];
  readonly memory: TeacherMemoryProfile;
  readonly lastPrompt: OrchestrationPromptPackage | null;
  readonly sending: boolean;
  readonly examplePrompts: readonly string[];
  readonly sendMessage: (text: string) => void;
  readonly newConversation: (scope?: "global" | "project" | "lesson") => void;
  readonly selectConversation: (id: string) => void;
  readonly pinConversation: (id: string) => void;
  readonly archiveConversation: (id: string) => void;
  readonly summarizeActive: () => void;
  readonly refreshMemory: () => void;
  readonly rememberNote: (
    kind: "style" | "format" | "feedback",
    value: string,
  ) => void;
};

const TeacherAssistantContext =
  createContext<TeacherAssistantContextValue | null>(null);

export function TeacherAssistantProvider({
  children,
  activeProjectId,
}: {
  children: ReactNode;
  activeProjectId?: string | null;
}) {
  const { projects, getProject } = useProjects();
  const location = useLocation();
  const [tick, setTick] = useState(0);
  const [viewId, setViewId] = useState<AssistantViewId>("chat");
  const [floatingOpen, setFloatingOpen] = useState(false);
  const [historyQuery, setHistoryQuery] = useState("");
  const [sending, setSending] = useState(false);
  const [lastPrompt, setLastPrompt] =
    useState<OrchestrationPromptPackage | null>(null);
  const [activeId, setActiveId] = useState<string | null>(() =>
    assistantRepository.getActiveId(),
  );

  const refresh = useCallback(() => setTick((t) => t + 1), []);

  const memory = useMemo(() => {
    void tick;
    return assistantRepository.getMemory(TEACHER_ID);
  }, [tick]);

  const context = useMemo(() => {
    void tick;
    let studioActive: string | null | undefined = activeProjectId;
    if (!studioActive) {
      try {
        studioActive = localStorage.getItem("prima.studio.activeProject");
      } catch {
        studioActive = null;
      }
    }
    return buildAssistantContext({
      teacherId: TEACHER_ID,
      teacherName: TEACHER_NAME,
      projects,
      pathname: location.pathname,
      search: location.search.replace(/^\?/, ""),
      activeProjectId: studioActive,
      memory,
    });
  }, [
    tick,
    projects,
    location.pathname,
    location.search,
    activeProjectId,
    memory,
  ]);

  const conversations = useMemo(() => {
    void tick;
    return historyQuery.trim()
      ? assistantRepository.searchConversations(historyQuery)
      : assistantRepository.listConversations();
  }, [tick, historyQuery]);

  const activeConversation = useMemo(() => {
    void tick;
    if (!activeId) return null;
    return assistantRepository.getConversation(activeId) ?? null;
  }, [activeId, tick]);

  const proactive = useMemo(() => {
    const project = context.projectId
      ? getProject(context.projectId)
      : undefined;
    return buildProactiveHints({ context, project });
  }, [context, getProject]);

  useEffect(() => {
    if (!activeId) {
      const existing = assistantRepository.listConversations()[0];
      if (existing) {
        setActiveId(existing.id);
        assistantRepository.setActiveId(existing.id);
      }
    }
  }, [activeId]);

  const ensureConversation = useCallback(() => {
    if (activeId && assistantRepository.getConversation(activeId)) {
      return assistantRepository.getConversation(activeId)!;
    }
    const created = assistantRepository.createConversation({
      title: context.projectTitle
        ? `PRIMA · ${context.projectTitle}`
        : "Conversație PRIMA",
      scope: context.projectId ? "project" : "global",
      projectId: context.projectId,
      lessonId: context.lessonId,
      documentId: context.documentId,
    });
    setActiveId(created.id);
    refresh();
    return created;
  }, [activeId, context, refresh]);

  const value: TeacherAssistantContextValue = {
    context,
    conversations,
    activeConversation,
    viewId,
    setViewId,
    floatingOpen,
    setFloatingOpen,
    toggleFloating: () => setFloatingOpen((v) => !v),
    historyQuery,
    setHistoryQuery,
    proactive,
    memory,
    lastPrompt,
    sending,
    examplePrompts: EXAMPLE_PROMPTS,
    sendMessage: (text) => {
      const utterance = text.trim();
      if (!utterance || sending) return;
      setSending(true);
      try {
        const conversation = ensureConversation();
        const project = context.projectId
          ? getProject(context.projectId)
          : undefined;
        const { teacherMessage, assistantMessage, prompt } = runAssistantTurn({
          utterance,
          context,
          project,
        });
        assistantRepository.appendMessage(conversation.id, teacherMessage);
        const withAssistant = assistantRepository.appendMessage(
          conversation.id,
          assistantMessage,
        );
        setActiveId(withAssistant.id);
        setLastPrompt(prompt);
        setViewId("chat");
        refresh();
      } finally {
        setSending(false);
      }
    },
    newConversation: (scope = "project") => {
      const created = assistantRepository.createConversation({
        title:
          scope === "lesson" && context.lessonTitle
            ? `Lecție · ${context.lessonTitle}`
            : context.projectTitle
              ? `Proiect · ${context.projectTitle}`
              : "Conversație nouă",
        scope:
          scope === "lesson"
            ? "lesson"
            : context.projectId
              ? "project"
              : "global",
        projectId: context.projectId,
        lessonId: context.lessonId,
        documentId: context.documentId,
      });
      setActiveId(created.id);
      setViewId("chat");
      refresh();
    },
    selectConversation: (id) => {
      setActiveId(id);
      assistantRepository.setActiveId(id);
      setViewId("chat");
      refresh();
    },
    pinConversation: (id) => {
      const c = assistantRepository.getConversation(id);
      if (!c) return;
      assistantRepository.pin(id, !c.pinned);
      refresh();
    },
    archiveConversation: (id) => {
      assistantRepository.archive(id);
      if (activeId === id) setActiveId(null);
      refresh();
    },
    summarizeActive: () => {
      if (!activeConversation) return;
      const summary = summarizeConversation(activeConversation.messages);
      assistantRepository.updateSummary(activeConversation.id, summary);
      refresh();
    },
    refreshMemory: refresh,
    rememberNote: (kind, value) => {
      if (!value.trim()) return;
      assistantRepository.rememberPreference(TEACHER_ID, kind, value.trim());
      refresh();
    },
  };

  return (
    <TeacherAssistantContext.Provider value={value}>
      {children}
    </TeacherAssistantContext.Provider>
  );
}

export function useTeacherAssistant(): TeacherAssistantContextValue {
  const ctx = useContext(TeacherAssistantContext);
  if (!ctx) {
    throw new Error(
      "useTeacherAssistant must be used within TeacherAssistantProvider",
    );
  }
  return ctx;
}
