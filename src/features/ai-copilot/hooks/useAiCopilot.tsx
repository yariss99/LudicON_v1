import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useProjects } from "../../../context/ProjectContext";
import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import { createLessonInStudio } from "../../lesson-studio/services/lessonStudioRepository";
import {
  buildContextGreeting,
  resolveCopilotContext,
} from "../services/copilotContext";
import {
  mockCopilotReply,
  smartPromptsForContext,
} from "../services/copilotMockEngine";
import { copilotRepository } from "../services/copilotRepository";
import type {
  CopilotConversation,
  CopilotMessage,
  CopilotPanelMode,
  CopilotPrompt,
  CopilotQuickActionId,
  CopilotRuntimeContext,
  CommandId,
} from "../types";

type AiCopilotContextValue = {
  panelMode: CopilotPanelMode;
  setPanelMode: (mode: CopilotPanelMode) => void;
  expand: () => void;
  collapse: () => void;
  pin: () => void;
  hide: () => void;
  toggle: () => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  context: CopilotRuntimeContext;
  messages: CopilotMessage[];
  conversations: CopilotConversation[];
  prompts: CopilotPrompt[];
  smartPrompts: string[];
  busy: boolean;
  toast: string | null;
  clearToast: () => void;
  ask: (text: string, actionId?: CopilotQuickActionId) => void;
  runQuickAction: (actionId: CopilotQuickActionId) => void;
  setSelection: (text: string | null) => void;
  applyResponse: (
    content: string,
    action: "insert" | "copy" | "replace" | "append" | "save_note",
  ) => void;
  togglePinPrompt: (id: string) => void;
  loadConversation: (id: string) => void;
  newConversation: () => void;
  runCommand: (id: CommandId) => void;
};

const AiCopilotContext = createContext<AiCopilotContextValue | null>(null);

function seedSystemMessage(ctx: CopilotRuntimeContext): CopilotMessage {
  return {
    id: createId("msg"),
    role: "system",
    content: buildContextGreeting(ctx),
    createdAt: nowIso(),
  };
}

export function AiCopilotProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { projects, getProject } = useProjects();

  const [panelMode, setPanelModeState] = useState<CopilotPanelMode>(() => {
    const stored = copilotRepository.getPrefs().panelMode;
    // Feature 011: assistant never opens automatically on load.
    if (stored === "expanded" || stored === "pinned" || stored === "collapsed") {
      copilotRepository.setPrefs({ panelMode: "hidden" });
      return "hidden";
    }
    return stored;
  });
  const [commandOpen, setCommandOpen] = useState(false);
  const [selection, setSelection] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [conversations, setConversations] = useState(() =>
    copilotRepository.listConversations(),
  );
  const [prompts, setPrompts] = useState(() => copilotRepository.listPrompts());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<CopilotMessage[]>([]);

  const context = useMemo(
    () =>
      resolveCopilotContext({
        pathname: location.pathname,
        projects,
        selection,
      }),
    [location.pathname, projects, selection],
  );

  const setPanelMode = useCallback((mode: CopilotPanelMode) => {
    setPanelModeState(mode);
    copilotRepository.setPrefs({ panelMode: mode });
  }, []);

  const expand = useCallback(() => setPanelMode("expanded"), [setPanelMode]);
  const collapse = useCallback(() => setPanelMode("collapsed"), [setPanelMode]);
  const pin = useCallback(() => setPanelMode("pinned"), [setPanelMode]);
  const hide = useCallback(() => setPanelMode("hidden"), [setPanelMode]);
  const toggle = useCallback(() => {
    setPanelMode(
      panelMode === "hidden" || panelMode === "collapsed"
        ? "expanded"
        : "collapsed",
    );
  }, [panelMode, setPanelMode]);

  // Refresh system greeting when context changes and conversation empty/system-only
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return [seedSystemMessage(context)];
      if (prev.length === 1 && prev[0]?.role === "system") {
        return [seedSystemMessage(context)];
      }
      return prev;
    });
  }, [context.projectId, context.lessonId, context.route]);

  // Global selection listener
  useEffect(() => {
    const onSel = () => {
      const text = window.getSelection()?.toString().trim() || "";
      if (text.length > 8) setSelection(text.slice(0, 800));
    };
    document.addEventListener("mouseup", onSel);
    return () => document.removeEventListener("mouseup", onSel);
  }, []);

  // CTRL/CMD + K
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setCommandOpen((v) => !v);
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "j") {
        event.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  const persistActive = useCallback(
    (nextMessages: CopilotMessage[]) => {
      const id = activeId ?? createId("cnv");
      if (!activeId) setActiveId(id);
      const conversation: CopilotConversation = {
        id,
        projectId: context.projectId,
        projectName: context.projectName || "Global",
        title:
          nextMessages.find((m) => m.role === "user")?.content.slice(0, 48) ||
          "New conversation",
        messages: nextMessages,
        createdAt: nowIso(),
        updatedAt: nowIso(),
      };
      copilotRepository.saveConversation(conversation);
      setConversations(copilotRepository.listConversations());
    },
    [activeId, context.projectId, context.projectName],
  );

  const ask = useCallback(
    (text: string, actionId?: CopilotQuickActionId) => {
      const trimmed = text.trim();
      if (!trimmed || busy) return;
      expand();
      copilotRepository.touchPrompt(trimmed);
      setPrompts(copilotRepository.listPrompts());

      const userMsg: CopilotMessage = {
        id: createId("msg"),
        role: "user",
        content: trimmed,
        createdAt: nowIso(),
        actionId,
        promptLabel: trimmed,
      };

      setBusy(true);
      setMessages((prev) => {
        const base = prev.length ? prev : [seedSystemMessage(context)];
        return [...base, userMsg];
      });

      window.setTimeout(() => {
        const reply: CopilotMessage = {
          id: createId("msg"),
          role: "assistant",
          content: mockCopilotReply({
            prompt: trimmed,
            actionId,
            context,
          }),
          createdAt: nowIso(),
          actionId,
        };
        setMessages((prev) => {
          const next = [...prev, reply];
          persistActive(next);
          return next;
        });
        setBusy(false);
      }, 420);
    },
    [busy, context, expand, persistActive],
  );

  const runQuickAction = useCallback(
    (actionId: CopilotQuickActionId) => {
      const label =
        actionId.replaceAll("_", " ").replace(/^\w/, (c) => c.toUpperCase());
      ask(label, actionId);
    },
    [ask],
  );

  const applyResponse = useCallback(
    (
      content: string,
      action: "insert" | "copy" | "replace" | "append" | "save_note",
    ) => {
      if (action === "copy") {
        void navigator.clipboard?.writeText(content);
        setToast("Copied to clipboard");
        return;
      }
      if (action === "save_note") {
        copilotRepository.saveNote({
          projectId: context.projectId,
          content,
        });
        setToast("Saved as note");
        return;
      }
      // insert / replace / append — mock UX feedback (no live editor bridge yet)
      const detail = {
        action,
        content,
        projectId: context.projectId,
        lessonId: context.lessonId,
      };
      window.dispatchEvent(new CustomEvent("prima:copilot-apply", { detail }));
      setToast(
        action === "insert"
          ? "Ready to insert into current document"
          : action === "replace"
            ? "Ready to replace selection"
            : "Ready to append to document",
      );
    },
    [context.projectId, context.lessonId],
  );

  const togglePinPrompt = useCallback((id: string) => {
    setPrompts(copilotRepository.togglePinPrompt(id));
  }, []);

  const loadConversation = useCallback((id: string) => {
    const found = copilotRepository.listConversations().find((c) => c.id === id);
    if (!found) return;
    setActiveId(found.id);
    setMessages(found.messages);
    expand();
  }, [expand]);

  const newConversation = useCallback(() => {
    setActiveId(null);
    setMessages([seedSystemMessage(context)]);
  }, [context]);

  const runCommand = useCallback(
    (id: CommandId) => {
      setCommandOpen(false);
      if (id === "ask_ai") {
        expand();
        return;
      }
      if (id === "open_project") {
        navigate("/projects");
        return;
      }
      if (id === "settings") {
        navigate("/settings");
        return;
      }
      if (id === "search") {
        navigate("/projects");
        return;
      }
      if (id === "create_worksheet") {
        if (context.projectId) navigate(`/studio/${context.projectId}/worksheets`);
        else navigate("/projects");
        return;
      }
      if (id === "create_lesson") {
        const projectId =
          context.projectId ||
          projects.find((p) => !p.archived)?.id ||
          null;
        if (!projectId) {
          navigate("/projects");
          setToast("Create a project first");
          return;
        }
        const project = getProject(projectId);
        const lesson = createLessonInStudio(projectId, {
          subject: project?.subject || "",
          grade: project?.grade || "",
          title: "Untitled lesson",
        });
        navigate(`/lesson-studio/${projectId}/${lesson.id}`);
        expand();
      }
    },
    [
      context.projectId,
      expand,
      getProject,
      navigate,
      projects,
    ],
  );

  const value: AiCopilotContextValue = {
    panelMode,
    setPanelMode,
    expand,
    collapse,
    pin,
    hide,
    toggle,
    commandOpen,
    setCommandOpen,
    context,
    messages,
    conversations,
    prompts,
    smartPrompts: smartPromptsForContext(context),
    busy,
    toast,
    clearToast: () => setToast(null),
    ask,
    runQuickAction,
    setSelection,
    applyResponse,
    togglePinPrompt,
    loadConversation,
    newConversation,
    runCommand,
  };

  return (
    <AiCopilotContext.Provider value={value}>
      {children}
    </AiCopilotContext.Provider>
  );
}

export function useAiCopilot() {
  const ctx = useContext(AiCopilotContext);
  if (!ctx) {
    throw new Error("useAiCopilot must be used within AiCopilotProvider");
  }
  return ctx;
}
