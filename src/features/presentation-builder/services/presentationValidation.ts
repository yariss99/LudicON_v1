import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  PresentationDocument,
  PresentationValidationIssue,
  PresentationValidationReport,
} from "../types";

export function validatePresentation(
  doc: PresentationDocument,
): PresentationValidationReport {
  const issues: PresentationValidationIssue[] = [];

  if (!doc.projectId) {
    issues.push({
      id: createId("pvi"),
      severity: "error",
      code: "PB_PROJECT_REQUIRED",
      message: "Prezentarea trebuie legată de un proiect.",
      sectionId: "general",
      repairSuggestion: "Creează prezentarea din spațiul proiectului.",
    });
  }

  if (!doc.title.trim()) {
    issues.push({
      id: createId("pvi"),
      severity: "error",
      code: "PB_TITLE_REQUIRED",
      message: "Titlul prezentării este obligatoriu.",
      sectionId: "general",
      repairSuggestion: "Adaugă un titlu clar pentru clasă.",
    });
  }

  if (doc.slides.length < 3) {
    issues.push({
      id: createId("pvi"),
      severity: "error",
      code: "PB_SLIDES_REQUIRED",
      message: "Prezentarea are prea puține slide-uri.",
      sectionId: "slides",
      repairSuggestion: "Generează prezentarea dintr-o resursă PRIMA.",
    });
  }

  const hasTitle = doc.slides.some((s) => s.type === "title");
  const hasObjectives = doc.slides.some((s) => s.type === "objectives");
  const hasSummary = doc.slides.some(
    (s) => s.type === "summary" || s.type === "homework",
  );
  if (doc.slides.length > 0 && (!hasTitle || !hasObjectives || !hasSummary)) {
    issues.push({
      id: createId("pvi"),
      severity: "warning",
      code: "PB_FLOW_INCOMPLETE",
      message:
        "Fluxul pedagogic ar trebui să aibă titlu, obiective și rezumat/temă.",
      sectionId: "outline",
      repairSuggestion: "Completează outline-ul sau regenerează prezentarea.",
    });
  }

  const dense = doc.slides.filter(
    (s) => s.body.length > 420 || s.bullets.join(" ").length > 320,
  );
  if (dense.length > 0) {
    issues.push({
      id: createId("pvi"),
      severity: "warning",
      code: "PB_READABILITY",
      message: `${dense.length} slide-uri sunt prea dense pentru lizibilitate.`,
      sectionId: "slides",
      repairSuggestion: "Îmbunătățește slide-urile sau împarte conținutul.",
    });
  }

  const missingNotes = doc.slides.filter((s) => !s.speakerNotes.trim()).length;
  if (missingNotes > Math.ceil(doc.slides.length / 2)) {
    issues.push({
      id: createId("pvi"),
      severity: "info",
      code: "PB_SPEAKER_NOTES",
      message: "Multe slide-uri nu au note de vorbitor.",
      sectionId: "notes",
      repairSuggestion: "Generează speaker notes cu AI.",
    });
  }

  if (doc.estimatedMinutes > 40) {
    issues.push({
      id: createId("pvi"),
      severity: "info",
      code: "PB_TIMING",
      message: `Durata estimată (${doc.estimatedMinutes} min) poate depăși o oră tipică.`,
      sectionId: "general",
      repairSuggestion: "Scurtează slide-urile sau timpul pe slide.",
    });
  }

  if (doc.objectives.length < 1 && doc.source.kind !== "template") {
    issues.push({
      id: createId("pvi"),
      severity: "warning",
      code: "PB_CURRICULUM",
      message: "Obiectivele lipsesc — alinierea curriculară e slabă.",
      sectionId: "general",
      repairSuggestion: "Importă obiectivele din lecție / sursă.",
    });
  }

  const themesOk = Boolean(doc.themeId);
  if (!themesOk) {
    issues.push({
      id: createId("pvi"),
      severity: "warning",
      code: "PB_VISUAL_CONSISTENCY",
      message: "Tema vizuală nu este setată.",
      sectionId: "theme",
      repairSuggestion: "Alege o temă din Theme Manager.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 22 - warnings * 8));
  const passed = errors === 0 && score >= 55;

  return { score, passed, issues, validatedAt: nowIso() };
}
