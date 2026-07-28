import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { ConfidenceMap } from "../../../engines/decision";
import {
  AI_SUGGESTION_SEED,
  SECTION_HIGHLIGHT_MS,
  STREAMING_LABELS,
} from "../constants";
import { stashReviewHandoff } from "../../blueprint-review";
import {
  createEmptyDraft,
  createExperienceSession,
  processTeacherMessage,
  type ExperienceEngineSession,
} from "../services/conversationEngine";
import {
  buildProgressViews,
  diffUpdatedSections,
} from "../services/blueprintProgress";
import { decisionUpdatedToPanelIds } from "../services/decisionAdapter";
import { panelIdsToCanvasHighlights } from "../services/canvasHighlight";
import { buildIntelligentCanvas } from "../services/intelligentCanvas";
import type { CanvasSectionId } from "../types/canvas";
import type {
  AttachmentState,
  BlueprintProgressId,
  ConversationMessage,
  ConversationTopicId,
  StreamingState,
} from "../types";
import type { SecondaryOptionId } from "../components/SecondaryStartOptions";
import { useBlueprintPanelLayout } from "./useBlueprintPanelLayout";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * CE-001 / CE-002 / CE-003 — Guided conversation + Intelligent Learning Canvas.
 */
export function useCreateExperience() {
  const navigate = useNavigate();
  const panelLayout = useBlueprintPanelLayout();

  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [draft, setDraft] = useState(createEmptyDraft);
  const [session, setSession] = useState<ExperienceEngineSession>(() =>
    createExperienceSession(),
  );
  const [confidenceMap, setConfidenceMap] = useState<ConfidenceMap | null>(
    null,
  );
  const [currentTopic, setCurrentTopic] =
    useState<ConversationTopicId>("opening");
  const [input, setInput] = useState("");
  const [phaseError, setPhaseError] = useState<string | null>(null);
  const [streaming, setStreaming] = useState<StreamingState>({
    active: false,
    label: STREAMING_LABELS[0],
  });
  const [attachmentState] = useState<AttachmentState>({
    enabled: false,
    pendingCount: 0,
  });
  const [highlightedPanelIds, setHighlightedPanelIds] = useState<
    ReadonlySet<BlueprintProgressId>
  >(() => new Set());
  const [highlightedCanvasIds, setHighlightedCanvasIds] = useState<
    ReadonlySet<CanvasSectionId>
  >(() => new Set());
  const [inferredCanvasIds, setInferredCanvasIds] = useState<
    ReadonlySet<CanvasSectionId>
  >(() => new Set());
  const [panelOpen, setPanelOpen] = useState(true);
  const highlightTimer = useRef<number | null>(null);
  const inferredTimer = useRef<number | null>(null);
  const autoOpenedRef = useRef(false);
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const progress = useMemo(
    () =>
      buildProgressViews(draft, {
        currentTopic,
        highlightedIds: highlightedPanelIds,
        confidenceMap,
      }),
    [confidenceMap, currentTopic, draft, highlightedPanelIds],
  );

  const latestPrimaMessage = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i -= 1) {
      if (messages[i]?.role === "prima") return messages[i] ?? null;
    }
    return null;
  }, [messages]);

  const learningCanvas = useMemo(
    () =>
      buildIntelligentCanvas({
        draft,
        currentTopic,
        confidenceMap,
        guided: latestPrimaMessage?.guided ?? null,
        newlyUpdatedIds: highlightedCanvasIds,
        inferredIds: inferredCanvasIds,
      }),
    [
      confidenceMap,
      currentTopic,
      draft,
      highlightedCanvasIds,
      inferredCanvasIds,
      latestPrimaMessage?.guided,
    ],
  );

  const conversationStarted = messages.length > 0;

  useEffect(() => {
    if (panelLayout === "collapsible") setPanelOpen(false);
    if (panelLayout === "sticky") setPanelOpen(true);
    if (panelLayout === "drawer") setPanelOpen(false);
  }, [panelLayout]);

  const flashHighlights = useCallback((panelIds: BlueprintProgressId[]) => {
    if (panelIds.length === 0) return;
    setHighlightedPanelIds(new Set(panelIds));
    setHighlightedCanvasIds(new Set(panelIdsToCanvasHighlights(panelIds)));
    if (highlightTimer.current) {
      window.clearTimeout(highlightTimer.current);
    }
    highlightTimer.current = window.setTimeout(() => {
      setHighlightedPanelIds(new Set());
      setHighlightedCanvasIds(new Set());
      highlightTimer.current = null;
    }, SECTION_HIGHLIGHT_MS);
  }, []);

  const flashInferred = useCallback((ids: CanvasSectionId[]) => {
    if (ids.length === 0) return;
    setInferredCanvasIds(new Set(ids));
    if (inferredTimer.current) {
      window.clearTimeout(inferredTimer.current);
    }
    inferredTimer.current = window.setTimeout(() => {
      setInferredCanvasIds(new Set());
      inferredTimer.current = null;
    }, SECTION_HIGHLIGHT_MS);
  }, []);

  useEffect(
    () => () => {
      if (highlightTimer.current) window.clearTimeout(highlightTimer.current);
      if (inferredTimer.current) window.clearTimeout(inferredTimer.current);
    },
    [],
  );

  const resetSession = useCallback(() => {
    const fresh = createExperienceSession();
    setSession(fresh);
    sessionRef.current = fresh;
    setPhaseError(null);
    setConfidenceMap(null);
    setMessages([]);
    setCurrentTopic("opening");
    setDraft(createEmptyDraft());
    setHighlightedPanelIds(new Set());
    setHighlightedCanvasIds(new Set());
    setInferredCanvasIds(new Set());
    setInput("");
  }, []);

  useEffect(() => {
    resetSession();
  }, [resetSession]);

  const continueConversation = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming.active) return;

    setPhaseError(null);

    const teacherMsg: ConversationMessage = {
      id: uid("teacher"),
      role: "teacher",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, teacherMsg]);
    setInput("");

    const label =
      STREAMING_LABELS[Math.floor(Math.random() * STREAMING_LABELS.length)];
    setStreaming({ active: true, label });

    try {
      const previousDraft = draft;
      const result = await processTeacherMessage({
        text,
        session: sessionRef.current,
      });

      setSession(result.session);
      sessionRef.current = result.session;
      setDraft(result.draft);
      setCurrentTopic(result.nextTopic);
      setConfidenceMap(result.decision.confidenceMap);

      const fromDecision = decisionUpdatedToPanelIds(
        result.decision.updatedSections,
      );
      const fromDiff = diffUpdatedSections(previousDraft, result.draft);
      flashHighlights(fromDecision.length ? fromDecision : fromDiff);
      flashInferred(result.inferredCanvasIds);

      if (!result.replySuppressed && result.guided) {
        const guided = result.guided;
        setMessages((prev) => [
          ...prev,
          {
            id: uid("prima"),
            role: "prima",
            content: result.primaReply,
            createdAt: new Date().toISOString(),
            topicId: result.nextTopic,
            guided,
          },
        ]);
      }

      // FEATURE-001 — when the lesson plan is complete, open Lesson Blueprint
      const lessonReady =
        result.pedagogicalDecision.action === "GENERATE_BLUEPRINT" ||
        result.draft.status === "ready_for_review" ||
        result.decision.engineState === "ready_for_approval";
      if (lessonReady && !autoOpenedRef.current) {
        autoOpenedRef.current = true;
        stashReviewHandoff(sessionRef.current.decisionSession);
        navigate("/blueprint/review/new");
        return;
      }
    } catch {
      setPhaseError(
        "Ceva a întrerupt conversația. Ce ai scris este în siguranță — încearcă din nou.",
      );
    } finally {
      setStreaming({ active: false, label: STREAMING_LABELS[0] });
    }
  }, [
    draft,
    flashHighlights,
    flashInferred,
    input,
    navigate,
    streaming.active,
  ]);

  const retryLast = useCallback(() => {
    setPhaseError(null);
  }, []);

  const openWorkspace = useCallback(() => {
    stashReviewHandoff(sessionRef.current.decisionSession);
    navigate("/blueprint/review/new");
  }, [navigate]);

  const handleSecondarySelect = useCallback(
    (id: SecondaryOptionId) => {
      if (id === "previous") {
        navigate("/");
        return;
      }
      if (id === "ai_suggestion") {
        setInput(AI_SUGGESTION_SEED);
      }
    },
    [navigate],
  );

  return {
    messages,
    draft,
    progress,
    learningCanvas,
    latestPrimaMessage,
    conversationStarted,
    input,
    setInput,
    streaming,
    attachmentState,
    phaseError,
    currentTopic,
    continueConversation,
    handleSecondarySelect,
    retryLast,
    openWorkspace,
    openReview: openWorkspace,
    panelLayout,
    panelOpen,
    setPanelOpen,
    decisionState: session.decisionSession.engineState,
    canOpenWorkspace:
      draft.status === "ready_for_review" ||
      (contextReady(draft) && draft.objectives.length > 0),
  };
}

function contextReady(draft: ReturnType<typeof createEmptyDraft>): boolean {
  return Boolean(
    draft.learningContext.grade &&
      draft.learningContext.subject &&
      draft.learningContext.topic,
  );
}
