import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  AssessmentDocument,
  AssessmentValidationIssue,
  AssessmentValidationReport,
} from "../types";
import { computeAssessmentAnalytics } from "./assessmentAnalytics";

/**
 * Validation Engine adapter for Assessment Builder.
 * Checks curriculum alignment, difficulty balance, competency coverage, time, quality.
 */
export function validateAssessment(
  doc: AssessmentDocument,
): AssessmentValidationReport {
  const issues: AssessmentValidationIssue[] = [];
  const analytics = computeAssessmentAnalytics(doc);
  const questions = doc.groups.flatMap((g) => g.questions);

  if (!doc.projectId || !doc.lessonId) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "AB_SCOPE_REQUIRED",
      message: "Evaluarea trebuie legată de un proiect și o lecție.",
      sectionId: "general",
      repairSuggestion: "Creează evaluarea din spațiul proiectului / lecției.",
    });
  }

  if (!doc.title.trim()) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "AB_TITLE_REQUIRED",
      message: "Titlul evaluării este obligatoriu.",
      sectionId: "general",
      repairSuggestion: "Adaugă un titlu clar.",
    });
  }

  if (doc.objectives.filter((o) => o.trim()).length < 1) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "AB_OBJECTIVES_REQUIRED",
      message: "Cel puțin un obiectiv de învățare este necesar.",
      sectionId: "objectives",
      repairSuggestion: "Aliniază evaluarea la obiectivele lecției.",
    });
  }

  if (questions.length < 1) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "AB_QUESTIONS_REQUIRED",
      message: "Evaluarea nu conține itemi.",
      sectionId: "questions",
      repairSuggestion: "Generează evaluarea sau adaugă itemi manual.",
    });
  }

  if (doc.competencies.length > 0) {
    const uncovered = doc.competencies.filter(
      (c) =>
        !questions.some((q) =>
          q.competencyIds.some((id) => id === c || id.includes(c)),
        ),
    );
    if (uncovered.length > 0) {
      issues.push({
        id: createId("avi"),
        severity: "warning",
        code: "AB_COMPETENCY_GAPS",
        message: `Competențe neacoperite: ${uncovered.slice(0, 3).join(", ")}`,
        sectionId: "competencies",
        repairSuggestion: "Rulează maparea pe competențe sau editează itemii.",
      });
    }
  } else {
    issues.push({
      id: createId("avi"),
      severity: "warning",
      code: "AB_COMPETENCIES_MISSING",
      message: "Nu există competențe definite.",
      sectionId: "competencies",
      repairSuggestion: "Importă competențele din lecție.",
    });
  }

  const { easy, medium, hard } = analytics.difficultyDistribution;
  if (questions.length >= 4 && (easy === 0 || hard === 0 || medium === 0)) {
    issues.push({
      id: createId("avi"),
      severity: "warning",
      code: "AB_DIFFICULTY_IMBALANCE",
      message: "Distribuția de dificultate este dezechilibrată.",
      sectionId: "questions",
      repairSuggestion: "Ajustează dificultatea cu AI sau manual.",
    });
  }

  if (Math.abs(analytics.estimatedMinutes - doc.durationMinutes) > 8) {
    issues.push({
      id: createId("avi"),
      severity: "info",
      code: "AB_TIME_MISMATCH",
      message: `Timp estimat ${analytics.estimatedMinutes} min vs planificat ${doc.durationMinutes} min.`,
      sectionId: "general",
      repairSuggestion: "Ajustează durata sau numărul de itemi.",
    });
  }

  const weakPrompts = questions.filter((q) => q.prompt.trim().length < 8);
  if (weakPrompts.length > 0) {
    issues.push({
      id: createId("avi"),
      severity: "warning",
      code: "AB_QUESTION_QUALITY",
      message: `${weakPrompts.length} itemi au enunțuri prea scurte.`,
      sectionId: "questions",
      repairSuggestion: "Îmbunătățește formularea itemilor.",
    });
  }

  const prompts = questions.map((q) => q.prompt.trim().toLowerCase());
  const dupes = prompts.filter(
    (p, i) => p && prompts.indexOf(p) !== i,
  ).length;
  if (dupes > 0) {
    issues.push({
      id: createId("avi"),
      severity: "warning",
      code: "AB_DUPLICATE_QUESTIONS",
      message: "Există itemi cu enunțuri repetate.",
      sectionId: "questions",
      repairSuggestion: "Detectează duplicatele și înlocuiește variantele.",
    });
  }

  if (
    (doc.kind === "rubric" || doc.scoring.mode === "rubric") &&
    doc.rubrics.length === 0
  ) {
    issues.push({
      id: createId("avi"),
      severity: "error",
      code: "AB_RUBRIC_REQUIRED",
      message: "Modul rubrică necesită cel puțin o rubrică.",
      sectionId: "rubrics",
      repairSuggestion: "Generează rubrici cu AI.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(
    0,
    Math.min(100, analytics.qualityScore - errors * 20 - warnings * 6),
  );
  const passed = errors === 0 && score >= 55;

  return {
    score,
    passed,
    issues,
    validatedAt: nowIso(),
  };
}
