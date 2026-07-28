import { createId } from "../../../utils/id";
import type { Project } from "../../../types/project";
import { lessonBuilderRepository } from "../../lesson-builder/services/lessonBuilderRepository";
import { assessmentBuilderRepository } from "../../assessment-builder/services/assessmentBuilderRepository";
import { projectWorkspaceRepository } from "../../project-workspace/services/projectWorkspaceRepository";
import type {
  AssistantContextPackage,
  AssistantProactiveHint,
} from "../types";

export function buildProactiveHints(input: {
  context: AssistantContextPackage;
  project?: Project;
}): AssistantProactiveHint[] {
  const hints: AssistantProactiveHint[] = [];
  const { context, project } = input;
  if (!project) {
    hints.push({
      id: createId("hint"),
      kind: "improvement",
      title: "Alege un proiect",
      detail:
        "Asistentul PRIMA lucrează cel mai bine în interiorul unui proiect.",
      href: "/projects",
      priority: 10,
    });
    return hints;
  }

  const lessons = lessonBuilderRepository.listByProject(project.id);
  const assessments = assessmentBuilderRepository.listByProject(project.id);
  const artifacts = projectWorkspaceRepository.listArtifacts(project.id);
  const hasWorksheet = artifacts.some((a) => a.kind === "worksheet");

  if (lessons.length === 0) {
    hints.push({
      id: createId("hint"),
      kind: "improvement",
      title: "Lipsește lecția de bază",
      detail: `Proiectul „${project.title}” nu are încă o lecție.`,
      href: `/lesson-builder/${project.id}`,
      priority: 9,
    });
  }

  if (lessons.length > 0 && assessments.length === 0) {
    hints.push({
      id: createId("hint"),
      kind: "assessment",
      title: "Recomand evaluare formativă",
      detail: "După lecție, o verificare scurtă închide bucla de învățare.",
      href: `/assessment-builder/${project.id}`,
      priority: 8,
    });
  }

  if (lessons.length > 0 && !hasWorksheet) {
    hints.push({
      id: createId("hint"),
      kind: "resource",
      title: "Adaugă o fișă de practică",
      detail: "O fișă diferențiată ajută elevii cu ritmuri diferite.",
      href: `/create/experience?intent=worksheet&project=${project.id}`,
      priority: 7,
    });
  }

  if (context.competencies.length === 0) {
    hints.push({
      id: createId("hint"),
      kind: "missing_competency",
      title: "Competențe neconfigurate",
      detail:
        "Setează competențele în setările proiectului pentru aliniere curriculară.",
      href: `/studio/${project.id}/settings`,
      priority: 8,
    });
  }

  const unvalidated = lessons.filter((l) => !l.validation?.passed);
  if (unvalidated.length > 0) {
    hints.push({
      id: createId("hint"),
      kind: "inconsistency",
      title: "Lecții fără validare reușită",
      detail: `${unvalidated.length} lecții așteaptă Validation Engine.`,
      href: `/lesson-builder/${project.id}/${unvalidated[0]!.id}`,
      priority: 6,
    });
  }

  if (context.subject && context.grade) {
    hints.push({
      id: createId("hint"),
      kind: "interdisciplinary",
      title: "Activitate interdisciplinară",
      detail: `Leagă ${context.subject} de o poveste sau un joc pentru ${context.grade}.`,
      href: `/story-builder/${project.id}`,
      priority: 4,
    });
  }

  hints.push({
    id: createId("hint"),
    kind: "differentiation",
    title: "Diferențiere recomandată",
    detail:
      "Cere o variantă simplificată + o variantă de aprofundare pentru aceeași lecție.",
    priority: 5,
  });

  return hints.sort((a, b) => b.priority - a.priority).slice(0, 8);
}
