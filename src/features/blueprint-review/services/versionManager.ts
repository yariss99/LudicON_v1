import type {
  ConfidenceMap,
  DecisionBlueprint,
} from "../../../engines/decision";
import type {
  BlueprintReviewDocument,
  BlueprintVersion,
  ComparisonResult,
  ReviewSectionId,
  SectionDiff,
} from "../types";
import { REVIEW_SECTIONS } from "../constants";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

function linesFor(
  blueprint: DecisionBlueprint,
  id: ReviewSectionId,
): string[] {
  switch (id) {
    case "learning_context": {
      const ctx = blueprint.learningContext;
      return [
        ctx.subject && `Subject: ${ctx.subject}`,
        ctx.grade && `Grade: ${ctx.grade}`,
        ctx.topic && `Topic: ${ctx.topic}`,
        ctx.durationMinutes && `Duration: ${ctx.durationMinutes} min`,
      ].filter(Boolean) as string[];
    }
    case "competencies":
      return [...blueprint.competencies];
    case "objectives":
      return [...blueprint.objectives];
    case "learning_flow":
      return [...blueprint.learningFlow];
    case "activities":
      return [...blueprint.activities];
    case "assessment":
      return [...blueprint.assessment];
    case "resources":
      return [...blueprint.resources];
    case "differentiation":
      return [...blueprint.differentiation];
    case "reflection":
      return [...blueprint.reflection];
  }
}

function nextVersionLabel(versions: BlueprintVersion[], approved: boolean): string {
  if (approved) {
    const majors = versions
      .map((v) => /^v(\d+)/.exec(v.versionLabel)?.[1])
      .filter(Boolean)
      .map(Number);
    const max = majors.length ? Math.max(...majors) : 0;
    return `v${max + 1}.0`;
  }
  const drafts = versions.filter((v) => !v.frozen);
  return `v0.${drafts.length + 1}`;
}

/**
 * VersionManager — lineage for Instructional Blueprint review.
 */
export const versionManager = {
  createVersion(input: {
    doc: BlueprintReviewDocument;
    changesSummary: string;
    frozen?: boolean;
    lifecycleState?: BlueprintVersion["lifecycleState"];
  }): { doc: BlueprintReviewDocument; version: BlueprintVersion } {
    const version: BlueprintVersion = {
      id: uid("bpv"),
      versionLabel: nextVersionLabel(
        input.doc.versions,
        Boolean(input.frozen),
      ),
      createdAt: new Date().toISOString(),
      author: input.doc.author,
      changesSummary: input.changesSummary,
      blueprint: structuredClone(input.doc.blueprint),
      confidenceMap: structuredClone(input.doc.confidenceMap),
      lifecycleState: input.lifecycleState ?? input.doc.lifecycleState,
      frozen: Boolean(input.frozen),
    };

    const previousVersionId = input.doc.currentVersionId;
    const doc: BlueprintReviewDocument = {
      ...input.doc,
      versions: [version, ...input.doc.versions],
      previousVersionId,
      currentVersionId: version.id,
      updatedAt: new Date().toISOString(),
    };

    return { doc, version };
  },

  restoreVersion(
    doc: BlueprintReviewDocument,
    versionId: string,
  ): BlueprintReviewDocument | null {
    if (doc.approvalState === "frozen" || doc.lifecycleState === "approved") {
      // Restore creates a new editable revision — unfreeze for needs_revision
    }

    const version = doc.versions.find((v) => v.id === versionId);
    if (!version) return null;

    const restored: BlueprintReviewDocument = {
      ...doc,
      blueprint: structuredClone(version.blueprint),
      confidenceMap: structuredClone(version.confidenceMap),
      lifecycleState: "needs_revision",
      approvalState: "blocked",
      generationUnlocked: false,
      approvalEvent: null,
      decisionSession: {
        ...doc.decisionSession,
        blueprint: structuredClone(version.blueprint),
        engineState: "waiting_teacher",
        lastOutput: doc.decisionSession.lastOutput
          ? {
              ...doc.decisionSession.lastOutput,
              blueprint: structuredClone(version.blueprint),
              confidenceMap: structuredClone(version.confidenceMap),
            }
          : null,
      },
    };

    const { doc: versioned } = this.createVersion({
      doc: restored,
      changesSummary: `Restored from ${version.versionLabel}`,
      lifecycleState: "needs_revision",
    });

    return versioned;
  },

  compare(
    doc: BlueprintReviewDocument,
    leftVersionId: string,
    rightVersionId: string,
  ): ComparisonResult | null {
    const left = doc.versions.find((v) => v.id === leftVersionId);
    const right = doc.versions.find((v) => v.id === rightVersionId);
    if (!left || !right) return null;

    const diffs: SectionDiff[] = REVIEW_SECTIONS.map((section) => {
      const before = linesFor(left.blueprint, section.id);
      const after = linesFor(right.blueprint, section.id);
      const beforeKey = before.join("\n");
      const afterKey = after.join("\n");

      let kind: SectionDiff["kind"] = "unchanged";
      if (!beforeKey && afterKey) kind = "added";
      else if (beforeKey && !afterKey) kind = "removed";
      else if (beforeKey !== afterKey) kind = "modified";

      return { sectionId: section.id, kind, before, after };
    });

    return {
      leftVersionId,
      rightVersionId,
      diffs,
    };
  },

  seedInitial(input: {
    author: string;
    blueprint: DecisionBlueprint;
    confidenceMap: ConfidenceMap;
  }): BlueprintVersion {
    return {
      id: uid("bpv"),
      versionLabel: "v0.1",
      createdAt: new Date().toISOString(),
      author: input.author,
      changesSummary: "Initial Blueprint presented for teacher review",
      blueprint: structuredClone(input.blueprint),
      confidenceMap: structuredClone(input.confidenceMap),
      lifecycleState: "under_review",
      frozen: false,
    };
  },
};
