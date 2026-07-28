import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  LessonDocument,
  LessonValidationIssue,
  LessonValidationReport,
} from "../types";

/**
 * Client-side Validation Engine adapter for Lesson Builder.
 * Fail-closed publish path: score threshold + required structure.
 */
export function validateLesson(lesson: LessonDocument): LessonValidationReport {
  const issues: LessonValidationIssue[] = [];

  if (!lesson.general.title.trim()) {
    issues.push({
      id: createId("lvi"),
      severity: "error",
      code: "LB_TITLE_REQUIRED",
      message: "Titlul lecției este obligatoriu.",
      sectionId: "general",
      repairSuggestion: "Adaugă un titlu clar, aliniat la obiectivul orei.",
    });
  }

  if (!lesson.general.subject.trim() || !lesson.general.grade.trim()) {
    issues.push({
      id: createId("lvi"),
      severity: "error",
      code: "LB_CONTEXT_REQUIRED",
      message: "Disciplina și clasa sunt obligatorii (context proiect).",
      sectionId: "general",
      repairSuggestion: "Completează disciplina și clasa din proiect.",
    });
  }

  if (lesson.objectives.filter((o) => o.trim()).length < 1) {
    issues.push({
      id: createId("lvi"),
      severity: "error",
      code: "LB_OBJECTIVES_REQUIRED",
      message: "Cel puțin un obiectiv de învățare este necesar.",
      sectionId: "objectives",
      repairSuggestion: "Formulează 1–3 obiective observabile.",
    });
  }

  if (lesson.competencies.filter((c) => c.trim()).length < 1) {
    issues.push({
      id: createId("lvi"),
      severity: "warning",
      code: "LB_COMPETENCIES_MISSING",
      message: "Competențele nu sunt setate.",
      sectionId: "competencies",
      repairSuggestion: "Leagă lecția de competențele din curriculum.",
    });
  }

  const emptyPhases = lesson.phases.filter((p) => !p.content.trim());
  if (emptyPhases.length >= 4) {
    issues.push({
      id: createId("lvi"),
      severity: "warning",
      code: "LB_PHASES_SPARSE",
      message: "Majoritatea fazelor sunt goale.",
      sectionId: "phases",
      repairSuggestion: "Generează lecția completă sau completează fazele cheie.",
    });
  }

  const practice = lesson.phases.find((p) => p.id === "practice");
  if (practice && !practice.content.trim() && lesson.blocks.every((b) => b.phaseId !== "practice")) {
    issues.push({
      id: createId("lvi"),
      severity: "warning",
      code: "LB_PRACTICE_WEAK",
      message: "Faza de practică este slabă sau lipsă.",
      sectionId: "phases",
      repairSuggestion: "Adaugă o activitate de practică ghidată.",
    });
  }

  if (!lesson.assessment.trim()) {
    issues.push({
      id: createId("lvi"),
      severity: "warning",
      code: "LB_ASSESSMENT_MISSING",
      message: "Evaluarea formativă lipsește.",
      sectionId: "assessment",
      repairSuggestion: "Sugerează evaluare cu AI sau adaugă un exit ticket.",
    });
  }

  if (!lesson.homework.trim()) {
    issues.push({
      id: createId("lvi"),
      severity: "info",
      code: "LB_HOMEWORK_OPTIONAL",
      message: "Nu există temă pentru acasă.",
      sectionId: "homework",
      repairSuggestion: "Opțional: o temă scurtă de consolidare.",
    });
  }

  const totalPhaseMinutes = lesson.phases.reduce(
    (sum, p) => sum + (p.durationMinutes || 0),
    0,
  );
  if (
    lesson.general.durationMinutes > 0 &&
    Math.abs(totalPhaseMinutes - lesson.general.durationMinutes) > 10
  ) {
    issues.push({
      id: createId("lvi"),
      severity: "info",
      code: "LB_TIMING_MISMATCH",
      message: `Durata fazelor (${totalPhaseMinutes} min) diferă de durata lecției (${lesson.general.durationMinutes} min).`,
      sectionId: "phases",
      repairSuggestion: "Ajustează minutele pe faze pentru ritm realist.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 25 - warnings * 8));
  const passed = errors === 0 && score >= 60;

  return {
    score,
    passed,
    issues,
    validatedAt: nowIso(),
  };
}
