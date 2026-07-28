/**
 * Create Experience Conversation Engine.
 *
 * Flow (AI-003 / AI-002 / AI-002.5):
 * Teacher Message → Canvas Update → Inference Engine
 * → Decision Engine → Validation Layer → verbalize → Teacher
 */

import {
  createDecisionSession,
  processTeacherTurn,
  type DecisionSession,
  type DecisionTurnOutput,
  type GuidedReplyParts,
} from "../../../engines/decision";
import {
  runPedagogicalInference,
  type InferenceResult,
  type InferredFact,
} from "../../../engines/inference";
import type { ReasoningTraceStep } from "../../../engines/reasoning";
import {
  validateInferredFacts,
  validatePedagogicalDecision,
  type ValidationResult,
} from "../../../engines/validation";
import {
  decidePedagogicalAction,
  type PedagogicalDecision,
} from "../../create-learning-experience/decision-engine";
import {
  applyInferenceToDraft,
  buildDecisionContext,
  createEmptyCanvasMeta,
  toLearningCanvas,
  type CanvasDecisionMeta,
} from "./decisionContextAdapter";
import { objectiveToTopic, toUiDraft } from "./decisionAdapter";
import {
  formatGuidedParts,
  verbalizePedagogicalDecision,
} from "./verbalizePedagogicalDecision";
import type { BlueprintDraft, ConversationTopicId } from "../types";
import type { CanvasSectionId } from "../types/canvas";

export type ExperienceEngineSession = {
  decisionSession: DecisionSession;
  canvasMeta: CanvasDecisionMeta;
  turnCount: number;
};

export type EngineTurnResult = {
  draft: BlueprintDraft;
  nextTopic: ConversationTopicId;
  primaReply: string;
  guided: GuidedReplyParts | null;
  confidence: number;
  decision: DecisionTurnOutput;
  pedagogicalDecision: PedagogicalDecision;
  validation: ValidationResult;
  inference: InferenceResult;
  /** Canvas section ids inferred this turn (UI “✓ Inferred” badge) */
  inferredCanvasIds: CanvasSectionId[];
  replySuppressed: boolean;
  session: ExperienceEngineSession;
  reasoningTrace: ReasoningTraceStep[];
};

const EMPTY_GUIDED: GuidedReplyParts = {
  understanding: "",
  canvasUpdate: null,
  whyNeeded: "",
  question: "",
};

function actionToTopic(action: PedagogicalDecision["action"]): ConversationTopicId {
  switch (action) {
    case "ASK_GRADE":
    case "LOAD_CURRICULUM":
      return "learning_context";
    case "LOAD_COMPETENCIES":
      return "competencies";
    case "ASK_OBJECTIVES":
      return "objectives";
    case "ASK_ACTIVITIES":
      return "activities";
    case "ASK_ASSESSMENT":
      return "assessment";
    case "ASK_RESOURCES":
      return "resources";
    case "GENERATE_BLUEPRINT":
      return "wrap_up";
    case "NONE":
    default:
      return "opening";
  }
}

function factToCanvasId(field: string): CanvasSectionId | null {
  switch (field) {
    case "subject":
      return "subject";
    case "grade":
      return "grade";
    case "topic":
      return "topic";
    default:
      return null;
  }
}

function resolveDecisionWithLoads(input: {
  draft: BlueprintDraft;
  meta: CanvasDecisionMeta;
  lastTeacherMessage: string;
  turnCount: number;
}): {
  decision: PedagogicalDecision;
  meta: CanvasDecisionMeta;
  draft: BlueprintDraft;
  loadFields: string[];
} {
  let meta = { ...input.meta };
  let draft = input.draft;
  const loadFields: string[] = [];

  for (let i = 0; i < 4; i++) {
    const context = buildDecisionContext({
      draft,
      meta,
      lastTeacherMessage: input.lastTeacherMessage,
      turnCount: input.turnCount,
    });
    const decision = decidePedagogicalAction(context);

    if (decision.action === "LOAD_CURRICULUM") {
      const label = [
        draft.learningContext.subject ?? "Curriculum",
        draft.learningContext.grade,
      ]
        .filter(Boolean)
        .join(" · ");
      meta = {
        ...meta,
        curriculumLoaded: true,
        curriculumLabel: label,
      };
      loadFields.push("curriculum");
      continue;
    }

    if (decision.action === "LOAD_COMPETENCIES") {
      const seeded =
        draft.competencies.length > 0
          ? draft.competencies
          : [
              draft.learningContext.topic
                ? `Explore and reason about ${draft.learningContext.topic}`
                : "Core curriculum competency for this grade",
            ];
      draft = {
        ...draft,
        competencies: seeded,
      };
      meta = { ...meta, competenciesLoaded: true };
      loadFields.push("competencies");
      continue;
    }

    return { decision, meta, draft, loadFields };
  }

  const fallback = decidePedagogicalAction(
    buildDecisionContext({
      draft,
      meta,
      lastTeacherMessage: input.lastTeacherMessage,
      turnCount: input.turnCount,
    }),
  );
  return { decision: fallback, meta, draft, loadFields };
}

function acceptInferredFacts(facts: InferredFact[]): InferredFact[] {
  const check = validateInferredFacts(facts);
  if (!check.approved) return [];
  return facts;
}

export async function processTeacherMessage(input: {
  text: string;
  session: ExperienceEngineSession | DecisionSession;
}): Promise<EngineTurnResult> {
  const experienceSession = normalizeSession(input.session);

  // 1. Teacher message → canvas / blueprint update (AI-001 extraction)
  const { session: decisionSession, output } = await processTeacherTurn(
    experienceSession.decisionSession,
    input.text,
  );

  let draft = toUiDraft(output.blueprint, output);
  let meta = experienceSession.canvasMeta;
  const turnCount = experienceSession.turnCount + 1;

  // 2. AI-003 Inference — enrich canvas before Decision Engine
  const preInferContext = buildDecisionContext({
    draft,
    meta,
    lastTeacherMessage: input.text,
    turnCount,
  });
  const rawInference = runPedagogicalInference({
    teacherMessage: input.text,
    canvas: preInferContext.canvas,
    pedagogicalState: preInferContext.pedagogicalState,
    conversationContext: preInferContext.conversationContext,
  });
  // Prefer turn-local inference; fall back to AI-001 facts already on the blueprint
  const pipelineFacts = acceptInferredFacts(
    decisionSession.lastInference?.inferredFacts ?? [],
  );
  const localFacts = acceptInferredFacts(rawInference.inferredFacts);
  const acceptedFacts = localFacts.length > 0 ? localFacts : pipelineFacts;

  let enrichedCanvas = preInferContext.canvas;
  for (const fact of acceptedFacts) {
    enrichedCanvas = {
      ...enrichedCanvas,
      [fact.field]: fact.value,
    };
  }
  const inference: InferenceResult = {
    updatedCanvas: enrichedCanvas,
    inferredFacts: acceptedFacts,
    confidence: acceptedFacts.length > 0 ? "HIGH" : "LOW",
  };

  if (localFacts.length > 0) {
    const applied = applyInferenceToDraft({
      draft,
      meta,
      canvas: enrichedCanvas,
    });
    draft = applied.draft;
    meta = applied.meta;
  }

  const inferredCanvasIds = acceptedFacts
    .map((f) => factToCanvasId(f.field))
    .filter((id): id is CanvasSectionId => id != null);

  // 3. Pedagogical Decision Engine (AI-002) — uses inferred canvas
  const resolved = resolveDecisionWithLoads({
    draft,
    meta,
    lastTeacherMessage: input.text,
    turnCount,
  });
  draft = resolved.draft;
  meta = resolved.meta;

  const decisionContext = buildDecisionContext({
    draft,
    meta,
    lastTeacherMessage: input.text,
    turnCount,
  });
  const canvas = toLearningCanvas(draft, meta);

  // 4. AI-002.5 Validation Layer
  const validation = validatePedagogicalDecision({
    decision: resolved.decision,
    canvas: decisionContext.canvas,
    pedagogicalState: decisionContext.pedagogicalState,
  });

  const updatedFields = [
    ...output.updatedSections.flatMap((section) => {
      if (section === "learning_context") {
        const fields: string[] = [];
        if (draft.learningContext.topic) fields.push("topic");
        if (draft.learningContext.subject) fields.push("subject");
        if (draft.learningContext.grade) fields.push("grade");
        return fields;
      }
      if (section === "competencies") return ["competencies"];
      if (section === "objectives") return ["objectives"];
      if (section === "activities") return ["activities"];
      if (section === "assessment") return ["assessment"];
      if (section === "resources") return ["resources"];
      return [];
    }),
    ...resolved.loadFields,
    ...acceptedFacts.map((f) => f.field),
  ];

  let guided: GuidedReplyParts | null = null;
  let primaReply = "";
  let replySuppressed = false;

  if (!validation.approved) {
    replySuppressed = true;
    console.info("Pedagogical decision rejected.");
    guided = null;
    primaReply = "";
  } else {
    guided = verbalizePedagogicalDecision({
      decision: validation.validatedDecision,
      canvas,
      updatedFields,
    });
    primaReply = formatGuidedParts(guided);
  }

  const nextSession: ExperienceEngineSession = {
    decisionSession: {
      ...decisionSession,
      lastOutput: {
        ...output,
        primaMessage: primaReply,
        guidedReply: guided ?? EMPTY_GUIDED,
      },
    },
    canvasMeta: meta,
    turnCount,
  };

  const sectionConfidence =
    output.confidenceMap[output.nextAction.sectionId]?.score ?? 0.5;

  return {
    draft,
    nextTopic: actionToTopic(resolved.decision.action),
    primaReply,
    guided,
    confidence: sectionConfidence,
    decision: {
      ...output,
      primaMessage: primaReply,
      guidedReply: guided ?? EMPTY_GUIDED,
    },
    pedagogicalDecision: resolved.decision,
    validation,
    inference,
    inferredCanvasIds,
    replySuppressed,
    session: nextSession,
    reasoningTrace: decisionSession.lastReasoningTrace ?? [],
  };
}

function normalizeSession(
  session: ExperienceEngineSession | DecisionSession,
): ExperienceEngineSession {
  if ("decisionSession" in session) {
    return session;
  }
  return {
    decisionSession: session,
    canvasMeta: createEmptyCanvasMeta(),
    turnCount: 0,
  };
}

export function createEmptyDraft(): BlueprintDraft {
  return toUiDraft(createDecisionSession().blueprint, null);
}

export function createExperienceSession(): ExperienceEngineSession {
  return {
    decisionSession: createDecisionSession(),
    canvasMeta: createEmptyCanvasMeta(),
    turnCount: 0,
  };
}

export { objectiveToTopic };
