import {
  analyzeLessonDesign,
  type PieAnalysisInput,
  type PieAnalysisReport,
} from "../../../engines/pie";
import type { UpeDocument } from "../types";

export function pieInputFromUpeDocument(
  document: UpeDocument,
): PieAnalysisInput {
  const exerciseMinutes = document.blocks
    .filter((b) => b.type === "exercise" || b.type === "open_question")
    .reduce((sum, b) => sum + (b.estimatedMinutes ?? 6), 0);

  return {
    lessonProjectId: document.lessonProjectId ?? document.id,
    title: document.title,
    subject: document.subject,
    grade: document.grade,
    availableMinutes: Math.max(exerciseMinutes, 45),
    competencies: [...document.competencies],
    learningObjectives: [...document.learningObjectives],
    learningFlow: [],
    activities: document.blocks
      .filter((b) => b.type === "exercise" || b.type === "interactive")
      .map((b) => ({
        id: b.id,
        title: String(b.content.text ?? b.type),
        durationMinutes: b.estimatedMinutes ?? 6,
        practical: true,
      })),
    assessment: document.blocks
      .filter((b) => b.type === "success_criteria" || b.type === "open_question")
      .map((b) => String(b.content.text ?? "")),
    resources: [{ id: document.id, label: document.title, objectType: document.objectType }],
    differentiation: [],
    reflection: document.blocks
      .filter((b) => b.type === "reflection")
      .map((b) => String(b.content.text ?? "")),
    language: document.language,
  };
}

export function analyzeUpeDocument(document: UpeDocument): PieAnalysisReport {
  return analyzeLessonDesign(pieInputFromUpeDocument(document));
}
