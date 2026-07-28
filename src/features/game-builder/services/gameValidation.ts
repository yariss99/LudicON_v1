import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  GameDocument,
  GameValidationIssue,
  GameValidationReport,
} from "../types";

export function validateGame(doc: GameDocument): GameValidationReport {
  const issues: GameValidationIssue[] = [];

  if (!doc.projectId || !doc.lessonId) {
    issues.push({
      id: createId("gvi"),
      severity: "error",
      code: "GB_SCOPE_REQUIRED",
      message: "Jocul trebuie legat de un proiect și o lecție.",
      sectionId: "general",
      repairSuggestion: "Creează jocul din spațiul proiectului.",
    });
  }

  if (!doc.title.trim()) {
    issues.push({
      id: createId("gvi"),
      severity: "error",
      code: "GB_TITLE_REQUIRED",
      message: "Titlul jocului este obligatoriu.",
      sectionId: "general",
      repairSuggestion: "Adaugă un titlu clar pentru clasă.",
    });
  }

  if (doc.objectives.filter((o) => o.trim()).length < 1) {
    issues.push({
      id: createId("gvi"),
      severity: "error",
      code: "GB_OBJECTIVES_REQUIRED",
      message: "Jocul trebuie aliniat la cel puțin un obiectiv.",
      sectionId: "objectives",
      repairSuggestion: "Importă obiectivele din lecție / sursă.",
    });
  }

  if (doc.levels.length < 1 && doc.challenges.length < 1 && doc.questions.length < 1) {
    issues.push({
      id: createId("gvi"),
      severity: "error",
      code: "GB_CONTENT_REQUIRED",
      message: "Jocul nu are conținut jucabil (nivele / provocări / întrebări).",
      sectionId: "levels",
      repairSuggestion: "Generează jocul dintr-o resursă PRIMA.",
    });
  }

  if (doc.source.kind === "template" && doc.challenges.length === 0) {
    issues.push({
      id: createId("gvi"),
      severity: "warning",
      code: "GB_EMPTY_CANVAS_RISK",
      message: "Jocul pornește din șablon fără conținut pedagogic încă.",
      sectionId: "source",
      repairSuggestion: "Generează din lecție, fișă, poveste sau evaluare.",
    });
  }

  if (doc.competencies.length < 1) {
    issues.push({
      id: createId("gvi"),
      severity: "warning",
      code: "GB_CURRICULUM_WEAK",
      message: "Lipsa competențelor slăbește alinierea curriculară.",
      sectionId: "competencies",
      repairSuggestion: "Adaugă competențe din lecție.",
    });
  }

  const diffs = doc.challenges.map((c) => c.difficulty);
  if (
    doc.challenges.length >= 3 &&
    (!diffs.includes("easy") || !diffs.includes("hard"))
  ) {
    issues.push({
      id: createId("gvi"),
      severity: "warning",
      code: "GB_DIFFICULTY_IMBALANCE",
      message: "Dificultatea provocărilor este dezechilibrată.",
      sectionId: "challenges",
      repairSuggestion: "Rulează „Echilibrează dificultatea”.",
    });
  }

  if (doc.estimatedMinutes < 5 || doc.estimatedMinutes > 45) {
    issues.push({
      id: createId("gvi"),
      severity: "info",
      code: "GB_DURATION",
      message: `Durata estimată (${doc.estimatedMinutes} min) poate fi nepotrivită pentru o oră tipică.`,
      sectionId: "general",
      repairSuggestion: "Ajustează numărul de nivele / itemi.",
    });
  }

  const enabledMechanics = doc.mechanics.filter((m) => m.enabled).length;
  if (enabledMechanics > 8) {
    issues.push({
      id: createId("gvi"),
      severity: "info",
      code: "GB_ENGAGEMENT_OVERLOAD",
      message: "Prea multe mecanici active pot dilua engagement-ul.",
      sectionId: "mechanics",
      repairSuggestion: "Păstrează 3–6 mecanici esențiale.",
    });
  }

  if (!doc.grade.trim()) {
    issues.push({
      id: createId("gvi"),
      severity: "warning",
      code: "GB_AGE_CONTEXT",
      message: "Clasa lipsește — verificarea adecvării pe vârstă e incompletă.",
      sectionId: "general",
      repairSuggestion: "Completează clasa din proiect.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 22 - warnings * 8));
  const passed = errors === 0 && score >= 55;

  return { score, passed, issues, validatedAt: nowIso() };
}
