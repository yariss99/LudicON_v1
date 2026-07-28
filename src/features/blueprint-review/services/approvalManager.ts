import type { BlueprintReviewDocument, ApprovalEvent } from "../types";
import { versionManager } from "./versionManager";
import { approveBlueprint } from "../../../engines/decision";

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * ApprovalManager — freezes Blueprint version, emits approval event,
 * unlocks Generation. Never approves while mandatory issues remain.
 */
export const approvalManager = {
  canApprove(doc: BlueprintReviewDocument): {
    ok: boolean;
    reasons: string[];
  } {
    if (doc.lifecycleState === "approved" && doc.approvalState === "frozen") {
      return {
        ok: false,
        reasons: ["Proiectul lecției este deja confirmat."],
      };
    }
    if (!doc.validation) {
      return {
        ok: false,
        reasons: ["Hai să verificăm împreună un aspect al lecției."],
      };
    }
    if (!doc.validation.readyForApproval) {
      return {
        ok: false,
        reasons:
          doc.validation.blockingReasons.length > 0
            ? doc.validation.blockingReasons
            : ["Mai avem nevoie de câteva informații pentru a continua."],
      };
    }
    if (!doc.validation.consistencyOk) {
      return {
        ok: false,
        reasons: [
          "Hai să armonizăm împreună un aspect al lecției înainte de confirmare.",
        ],
      };
    }
    return { ok: true, reasons: [] };
  },

  approve(
    doc: BlueprintReviewDocument,
    note?: string,
  ): { doc: BlueprintReviewDocument; event: ApprovalEvent } | { error: string } {
    const gate = this.canApprove(doc);
    if (!gate.ok) {
      return {
        error: gate.reasons[0] ?? "Confirmarea nu este încă posibilă.",
      };
    }

    // Align Decision Engine session state
    const decisionSession = approveBlueprint({
      ...doc.decisionSession,
      engineState: "ready_for_approval",
      blueprint: doc.blueprint,
    });

    let next: BlueprintReviewDocument = {
      ...doc,
      decisionSession,
      lifecycleState: "under_review",
      approvalState: "ready",
    };

    // Freeze approved version
    const { doc: versioned, version } = versionManager.createVersion({
      doc: next,
      changesSummary: note?.trim() || "Proiectul lecției a fost confirmat",
      frozen: true,
      lifecycleState: "approved",
    });

    // Supersede prior approved versions
    const versions = versioned.versions.map((v) =>
      v.id !== version.id && v.lifecycleState === "approved"
        ? { ...v, lifecycleState: "superseded" as const, frozen: true }
        : v,
    );

    const event: ApprovalEvent = {
      id: uid("approval"),
      versionId: version.id,
      versionLabel: version.versionLabel,
      approvedAt: new Date().toISOString(),
      author: doc.author,
      note,
    };

    next = {
      ...versioned,
      versions,
      lifecycleState: "approved",
      approvalState: "frozen",
      approvalEvent: event,
      generationUnlocked: true,
      updatedAt: new Date().toISOString(),
    };

    return { doc: next, event };
  },

  /**
   * FEATURE-001 — Teacher authority unlocks materials even when sections
   * are still being refined. Teacher never feels locked.
   */
  approveWithTeacherAuthority(
    doc: BlueprintReviewDocument,
    note?: string,
  ): { doc: BlueprintReviewDocument; event: ApprovalEvent } | { error: string } {
    if (doc.lifecycleState === "approved" && doc.approvalState === "frozen") {
      return {
        doc: { ...doc, generationUnlocked: true },
        event:
          doc.approvalEvent ?? {
            id: uid("approval"),
            versionId: doc.currentVersionId,
            versionLabel:
              doc.versions.find((v) => v.id === doc.currentVersionId)
                ?.versionLabel ?? "v1",
            approvedAt: new Date().toISOString(),
            author: doc.author,
            note,
          },
      };
    }

    const decisionSession = approveBlueprint({
      ...doc.decisionSession,
      engineState: "ready_for_approval",
      blueprint: doc.blueprint,
    });

    let next: BlueprintReviewDocument = {
      ...doc,
      decisionSession,
      lifecycleState: "under_review",
      approvalState: "ready",
    };

    const { doc: versioned, version } = versionManager.createVersion({
      doc: next,
      changesSummary:
        note?.trim() || "Profesorul a ales să creeze materialele didactice",
      frozen: true,
      lifecycleState: "approved",
    });

    const versions = versioned.versions.map((v) =>
      v.id !== version.id && v.lifecycleState === "approved"
        ? { ...v, lifecycleState: "superseded" as const, frozen: true }
        : v,
    );

    const event: ApprovalEvent = {
      id: uid("approval"),
      versionId: version.id,
      versionLabel: version.versionLabel,
      approvedAt: new Date().toISOString(),
      author: doc.author,
      note,
    };

    next = {
      ...versioned,
      versions,
      lifecycleState: "approved",
      approvalState: "frozen",
      approvalEvent: event,
      generationUnlocked: true,
      updatedAt: new Date().toISOString(),
    };

    return { doc: next, event };
  },
};
