import {
  createDecisionSession,
  processTeacherTurn,
  type ConfidenceMap,
  type DecisionSession,
} from "../../../engines/decision";
import { calculateConfidence } from "../../../engines/decision/services/confidenceCalculator";
import { teacherProfile } from "../../../data/workspaceData";
import type {
  BlueprintReviewDocument,
  ComparisonResult,
} from "../types";
import { validateBlueprint } from "./blueprintValidator";
import { versionManager } from "./versionManager";
import { approvalManager } from "./approvalManager";
import { parseReviewIntent } from "./reviewIntent";
import { blueprintReviewRepository } from "./blueprintReviewRepository";
import { buildSectionViews } from "./sectionViews";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function titleFromSession(session: DecisionSession): string {
  const ctx = session.blueprint.learningContext;
  if (ctx.topic && ctx.subject) {
    return `${ctx.topic[0]?.toUpperCase() ?? ""}${ctx.topic.slice(1)} · ${ctx.subject}`;
  }
  return "Proiectul lecției";
}

/**
 * ReviewOrchestrator — owns review flow.
 * Never regenerates Blueprint locally; refinements go through Decision Engine.
 */
export const reviewOrchestrator = {
  async createFromDecisionSession(
    session: DecisionSession,
    options?: { projectId?: string | null },
  ): Promise<BlueprintReviewDocument> {
    const confidenceMap: ConfidenceMap =
      session.lastOutput?.confidenceMap ??
      (await calculateConfidence({
        blueprint: session.blueprint,
        hasContradiction: false,
      }));

    const author = teacherProfile.fullName;
    const initial = versionManager.seedInitial({
      author,
      blueprint: session.blueprint,
      confidenceMap,
    });

    let doc: BlueprintReviewDocument = {
      id: uid("bpr"),
      title: titleFromSession(session),
      author,
      lifecycleState: "under_review",
      approvalState: "blocked",
      blueprint: structuredClone(session.blueprint),
      confidenceMap: structuredClone(confidenceMap),
      teacherComments: {},
      revisionLog: [],
      versions: [initial],
      currentVersionId: initial.id,
      previousVersionId: null,
      approvalEvent: null,
      generationUnlocked: false,
      projectId: options?.projectId ?? null,
      decisionSession: structuredClone(session),
      validation: null,
      plannedMaterials: [
        "worksheet",
        "presentation",
        "assessment",
      ],
      studioExtensions: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    doc = await this.runValidation(doc);
    return blueprintReviewRepository.save(doc);
  },

  async runValidation(
    doc: BlueprintReviewDocument,
  ): Promise<BlueprintReviewDocument> {
    const validation = await validateBlueprint({
      blueprint: doc.blueprint,
      confidenceMap: doc.confidenceMap,
    });

    const approvalState = validation.readyForApproval
      ? doc.lifecycleState === "approved"
        ? doc.approvalState
        : "ready"
      : "blocked";

    return {
      ...doc,
      validation,
      approvalState:
        doc.lifecycleState === "approved" ? "frozen" : approvalState,
      updatedAt: new Date().toISOString(),
    };
  },

  /**
   * Natural-language improvement — Decision Engine only. No form edits.
   */
  async requestImprovement(
    doc: BlueprintReviewDocument,
    teacherMessage: string,
  ): Promise<BlueprintReviewDocument> {
    const reopenedFromApproval =
      doc.lifecycleState === "approved" && doc.approvalState === "frozen";

    if (reopenedFromApproval) {
      // Re-open for revision — generation locks again
      doc = {
        ...doc,
        lifecycleState: "needs_revision",
        approvalState: "blocked",
        generationUnlocked: false,
      };
    }

    const intent = parseReviewIntent(teacherMessage, doc.blueprint);

    let session: DecisionSession = {
      ...structuredClone(doc.decisionSession),
      blueprint: structuredClone(doc.blueprint),
      engineState: "waiting_teacher",
      conversation: {
        ...doc.decisionSession.conversation,
        currentObjectiveId: intent.objectiveId,
      },
    };

    const { session: nextSession, output } = await processTeacherTurn(
      session,
      intent.decisionMessage,
    );

    // Review refinements replace the targeted section (no form edit; DE still decided)
    const refinedBlueprint = structuredClone(nextSession.blueprint);
    retainLatestSectionCapture(refinedBlueprint, intent.sectionId);
    nextSession.blueprint = refinedBlueprint;

    let next: BlueprintReviewDocument = {
      ...doc,
      blueprint: refinedBlueprint,
      confidenceMap: structuredClone(output.confidenceMap),
      decisionSession: nextSession,
      lifecycleState: reopenedFromApproval ? "needs_revision" : "under_review",
      approvalState: "blocked",
      generationUnlocked: false,
      revisionLog: [
        {
          sectionId: intent.sectionId,
          summary: intent.summary,
          at: new Date().toISOString(),
        },
        ...doc.revisionLog,
      ],
      teacherComments: {
        ...doc.teacherComments,
        [intent.sectionId]: [
          teacherMessage,
          ...(doc.teacherComments[intent.sectionId] ?? []),
        ],
      },
    };

    const { doc: versioned } = versionManager.createVersion({
      doc: next,
      changesSummary: intent.summary,
      lifecycleState: next.lifecycleState,
    });

    next = await this.runValidation(versioned);
    return blueprintReviewRepository.save(next);
  },

  approve(
    doc: BlueprintReviewDocument,
    note?: string,
  ): BlueprintReviewDocument | { error: string } {
    const result = approvalManager.approve(doc, note);
    if ("error" in result) return result;
    return blueprintReviewRepository.save(result.doc);
  },

  restoreVersion(
    doc: BlueprintReviewDocument,
    versionId: string,
  ): BlueprintReviewDocument | { error: string } {
    const restored = versionManager.restoreVersion(doc, versionId);
    if (!restored) return { error: "Versiunea nu a fost găsită." };
    return blueprintReviewRepository.save(restored);
  },

  async restoreAndValidate(
    doc: BlueprintReviewDocument,
    versionId: string,
  ): Promise<BlueprintReviewDocument | { error: string }> {
    const restored = this.restoreVersion(doc, versionId);
    if ("error" in restored) return restored;
    const validated = await this.runValidation(restored);
    return blueprintReviewRepository.save(validated);
  },

  compare(
    doc: BlueprintReviewDocument,
    leftVersionId: string,
    rightVersionId: string,
  ): ComparisonResult | null {
    return versionManager.compare(doc, leftVersionId, rightVersionId);
  },

  getSectionViews: buildSectionViews,

  load(id: string): BlueprintReviewDocument | null {
    return blueprintReviewRepository.getById(id);
  },

  createEmptySession(): DecisionSession {
    return createDecisionSession();
  },

  /** FEATURE-001 — persist teacher edits (auto-save). */
  saveTeacherEdits(doc: BlueprintReviewDocument): BlueprintReviewDocument {
    const next: BlueprintReviewDocument = {
      ...doc,
      decisionSession: {
        ...doc.decisionSession,
        blueprint: structuredClone(doc.blueprint),
      },
      title: titleFromSession({
        ...doc.decisionSession,
        blueprint: doc.blueprint,
      }),
      updatedAt: new Date().toISOString(),
    };
    return blueprintReviewRepository.save(next);
  },

  /** FEATURE-001 — unlock materials with teacher authority. */
  approveForTeachingMaterials(
    doc: BlueprintReviewDocument,
  ): BlueprintReviewDocument | { error: string } {
    const result = approvalManager.approveWithTeacherAuthority(
      doc,
      "Profesorul a ales să creeze materialele didactice",
    );
    if ("error" in result) return result;
    return blueprintReviewRepository.save(result.doc);
  },
};

function retainLatestSectionCapture(
  blueprint: DecisionSession["blueprint"],
  sectionId: import("../types").ReviewSectionId,
): void {
  switch (sectionId) {
    case "competencies":
      if (blueprint.competencies.length > 1) {
        blueprint.competencies = [blueprint.competencies.at(-1)!];
      }
      break;
    case "objectives":
      if (blueprint.objectives.length > 1) {
        blueprint.objectives = [blueprint.objectives.at(-1)!];
      }
      break;
    case "learning_flow":
      if (blueprint.learningFlow.length > 1) {
        blueprint.learningFlow = [blueprint.learningFlow.at(-1)!];
      }
      break;
    case "activities":
      if (blueprint.activities.length > 1) {
        blueprint.activities = [blueprint.activities.at(-1)!];
      }
      break;
    case "assessment":
      if (blueprint.assessment.length > 1) {
        blueprint.assessment = [blueprint.assessment.at(-1)!];
      }
      break;
    case "resources":
      if (blueprint.resources.length > 1) {
        blueprint.resources = [blueprint.resources.at(-1)!];
      }
      break;
    case "differentiation":
      if (blueprint.differentiation.length > 1) {
        blueprint.differentiation = [blueprint.differentiation.at(-1)!];
      }
      break;
    case "reflection":
      if (blueprint.reflection.length > 1) {
        blueprint.reflection = [blueprint.reflection.at(-1)!];
      }
      break;
    default:
      break;
  }
}
