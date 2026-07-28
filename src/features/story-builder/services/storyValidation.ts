import { createId } from "../../../utils/id";
import { nowIso } from "../../../utils/date";
import type {
  StoryDocument,
  StoryValidationIssue,
  StoryValidationReport,
} from "../types";

export function validateStory(doc: StoryDocument): StoryValidationReport {
  const issues: StoryValidationIssue[] = [];

  if (!doc.projectId || !doc.lessonId) {
    issues.push({
      id: createId("svi"),
      severity: "error",
      code: "SB_SCOPE_REQUIRED",
      message: "Povestea trebuie legată de un proiect și o lecție.",
      sectionId: "general",
      repairSuggestion: "Creează povestea din spațiul proiectului.",
    });
  }

  if (!doc.title.trim()) {
    issues.push({
      id: createId("svi"),
      severity: "error",
      code: "SB_TITLE_REQUIRED",
      message: "Titlul este obligatoriu.",
      sectionId: "general",
      repairSuggestion: "Adaugă un titlu atractiv și clar.",
    });
  }

  if (doc.objectives.filter((o) => o.trim()).length < 1) {
    issues.push({
      id: createId("svi"),
      severity: "error",
      code: "SB_OBJECTIVES_REQUIRED",
      message: "Cel puțin un obiectiv de învățare este necesar.",
      sectionId: "objectives",
      repairSuggestion: "Aliniază povestea la obiectivele lecției.",
    });
  }

  if (doc.scenes.length < 2) {
    issues.push({
      id: createId("svi"),
      severity: "error",
      code: "SB_SCENES_REQUIRED",
      message: "Povestea are prea puține scene.",
      sectionId: "scenes",
      repairSuggestion: "Generează povestea sau adaugă scene (intro + final).",
    });
  }

  const hasIntro = doc.scenes.some((s) => s.type === "introduction");
  const hasEnding = doc.scenes.some((s) => s.type === "ending");
  if (doc.scenes.length > 0 && (!hasIntro || !hasEnding)) {
    issues.push({
      id: createId("svi"),
      severity: "warning",
      code: "SB_ARC_INCOMPLETE",
      message: "Arcul narativ ar trebui să aibă introducere și final.",
      sectionId: "arc",
      repairSuggestion: "Adaugă scene de tip introduction și ending.",
    });
  }

  const emptyScenes = doc.scenes.filter((s) => !s.narration.trim());
  if (emptyScenes.length > 0) {
    issues.push({
      id: createId("svi"),
      severity: "warning",
      code: "SB_SCENE_EMPTY",
      message: `${emptyScenes.length} scene fără narațiune.`,
      sectionId: "scenes",
      repairSuggestion: "Completează narațiunea sau generează dialoguri.",
    });
  }

  const decisionScenes = doc.scenes.filter((s) => s.type === "decision");
  const brokenBranches = decisionScenes.filter((s) =>
    s.choices.some((c) => !c.targetSceneId),
  );
  if (brokenBranches.length > 0) {
    issues.push({
      id: createId("svi"),
      severity: "warning",
      code: "SB_BRANCHING_INCOMPLETE",
      message: "Există alegeri fără scenă țintă.",
      sectionId: "branching",
      repairSuggestion: "Leagă fiecare alegere de o scenă în editorul de ramificații.",
    });
  }

  if (doc.characters.length < 1) {
    issues.push({
      id: createId("svi"),
      severity: "info",
      code: "SB_CHARACTERS_MISSING",
      message: "Nu există personaje definite.",
      sectionId: "characters",
      repairSuggestion: "Generează personaje cu AI.",
    });
  }

  if (doc.competencies.length < 1) {
    issues.push({
      id: createId("svi"),
      severity: "warning",
      code: "SB_CURRICULUM_WEAK",
      message: "Lipsa mapării pe competențe slăbește alinierea curriculară.",
      sectionId: "objectives",
      repairSuggestion: "Importă competențele din lecție.",
    });
  }

  if (doc.estimatedMinutes > 25 && doc.readingLevel === "emerging") {
    issues.push({
      id: createId("svi"),
      severity: "info",
      code: "SB_READING_TIME",
      message: `Timp estimat ${doc.estimatedMinutes} min poate fi lung pentru nivelul emerging.`,
      sectionId: "general",
      repairSuggestion: "Ajustează nivelul de lectură sau scurtează scenele.",
    });
  }

  const errors = issues.filter((i) => i.severity === "error").length;
  const warnings = issues.filter((i) => i.severity === "warning").length;
  const score = Math.max(0, Math.min(100, 100 - errors * 22 - warnings * 8));
  const passed = errors === 0 && score >= 55;

  return { score, passed, issues, validatedAt: nowIso() };
}
