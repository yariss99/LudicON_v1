import type { ConfidenceMap, DecisionBlueprint } from "../../../engines/decision";
import { REVIEW_SECTIONS } from "../constants";
import type {
  BlueprintReviewDocument,
  SectionReviewView,
} from "../types";
import { sectionNavStatus } from "./blueprintValidator";

function summaryFor(
  blueprint: DecisionBlueprint,
  id: SectionReviewView["id"],
): string {
  switch (id) {
    case "learning_context": {
      const ctx = blueprint.learningContext;
      const parts = [ctx.subject, ctx.grade, ctx.topic, ctx.durationMinutes && `${ctx.durationMinutes} min`]
        .filter(Boolean);
      return parts.length
        ? parts.join(" · ")
        : "Contextul lecției nu este încă definit.";
    }
    case "competencies":
      return blueprint.competencies[0] ?? "Nicio competență captată încă.";
    case "objectives":
      return blueprint.objectives[0] ?? "Niciun obiectiv de învățare captat încă.";
    case "learning_flow":
      return blueprint.learningFlow[0] ?? "Parcursul lecției nu este încă schițat.";
    case "activities":
      return blueprint.activities[0] ?? "Nicio activitate de învățare captată încă.";
    case "assessment":
      return blueprint.assessment[0] ?? "Abordarea evaluării nu este încă definită.";
    case "resources":
      return blueprint.resources[0] ?? "Resursele nu sunt încă notate.";
    case "differentiation":
      return blueprint.differentiation[0] ?? "Diferențierea nu este încă precizată.";
    case "reflection":
      return blueprint.reflection[0] ?? "Semnul de reflecție nu este încă ales.";
  }
}

function notesFor(
  blueprint: DecisionBlueprint,
  confidenceMap: ConfidenceMap,
  id: SectionReviewView["id"],
): string[] {
  const notes: string[] = [];
  const field = confidenceMap[id];
  if (field?.rationale) notes.push(field.rationale);
  const assumptions = blueprint.assumptions[id];
  if (assumptions?.length) notes.push(...assumptions);
  return notes;
}

export function buildSectionViews(
  doc: BlueprintReviewDocument,
): SectionReviewView[] {
  return REVIEW_SECTIONS.map((section) => {
    const revisions = doc.revisionLog
      .filter((r) => r.sectionId === section.id)
      .map((r) => ({ at: r.at, summary: r.summary }));

    return {
      id: section.id,
      title: section.title,
      pedagogicalSummary: summaryFor(doc.blueprint, section.id),
      confidenceLevel: doc.confidenceMap[section.id]?.level ?? "unknown",
      supportingNotes: notesFor(doc.blueprint, doc.confidenceMap, section.id),
      teacherComments: doc.teacherComments[section.id] ?? [],
      revisionHistory: revisions,
      navStatus: sectionNavStatus(
        doc.blueprint,
        doc.confidenceMap,
        section.id,
        doc.validation,
      ),
    };
  });
}
