/**
 * Project ↔ PRIMA Core integration layer.
 * AI always operates inside the current project — no isolated prompts.
 */

import type { Project } from "../../../types/project";
import { projectWorkspaceRepository } from "./projectWorkspaceRepository";
import type {
  AiSuggestion,
  ArtifactKind,
  ProjectCoreContext,
  ProjectProgress,
  ProjectWorkspaceTabId,
} from "../types";

export function buildProjectCoreContext(input: {
  project: Project;
  activeTab: ProjectWorkspaceTabId;
  activeArtifactId?: string;
  intent?: string;
}): ProjectCoreContext {
  const meta = projectWorkspaceRepository.getMetadata(input.project.id);
  return {
    projectId: input.project.id,
    projectTitle: input.project.title,
    subject: input.project.subject,
    grade: input.project.grade,
    locale: "ro-RO",
    curriculumRef: meta.curriculumRef,
    competencies: meta.competencies,
    activeArtifactId: input.activeArtifactId,
    activeTab: input.activeTab,
    intent:
      input.intent ??
      `Lucrează în proiectul „${input.project.title}” (${input.project.subject}, ${input.project.grade})`,
  };
}

export function computeProgress(projectId: string): ProjectProgress {
  const artifacts = projectWorkspaceRepository
    .listArtifacts(projectId)
    .filter((a) => a.status !== "archived");
  const readyCount = artifacts.filter((a) => a.status === "ready").length;
  const draftCount = artifacts.filter((a) => a.status === "draft").length;
  const total = artifacts.length;
  return {
    totalArtifacts: total,
    readyCount,
    draftCount,
    percentComplete: total === 0 ? 0 : Math.round((readyCount / total) * 100),
  };
}

export function buildAiSuggestions(
  project: Project,
  tab: ProjectWorkspaceTabId,
): AiSuggestion[] {
  const artifacts = projectWorkspaceRepository.listArtifacts(project.id);
  const hasLesson = artifacts.some((a) => a.kind === "lesson");
  const hasWorksheet = artifacts.some((a) => a.kind === "worksheet");
  const hasAssessment = artifacts.some((a) => a.kind === "assessment");

  const suggestions: AiSuggestion[] = [];

  if (!hasLesson) {
    suggestions.push({
      id: "sug-lesson",
      title: "Generează prima lecție",
      reason: `Proiectul „${project.title}” nu are încă o lecție gata.`,
      actionLabel: "Creează lecție",
      href: `/create/experience?intent=lesson&project=${project.id}`,
      kind: "lesson",
    });
  }
  if (hasLesson && !hasWorksheet) {
    suggestions.push({
      id: "sug-ws",
      title: "Adaugă o fișă de practică",
      reason: "O fișă scurtă întărește obiectivele lecției.",
      actionLabel: "Generează fișă",
      href: `/create/experience?intent=worksheet&project=${project.id}`,
      kind: "worksheet",
    });
  }
  if (hasLesson && !hasAssessment) {
    suggestions.push({
      id: "sug-as",
      title: "Pregătește o verificare",
      reason: "Evaluarea formativă oferă feedback imediat elevilor.",
      actionLabel: "Creează evaluare",
      href: `/create/experience?intent=assessment&project=${project.id}`,
      kind: "assessment",
    });
  }

  if (tab === "presentations") {
    suggestions.push({
      id: "sug-pres",
      title: "Schiță de prezentare",
      reason: "PRIMA poate propune diapozitive aliniate la competențe.",
      actionLabel: "Generează",
      href: `/create/experience?intent=presentation&project=${project.id}`,
      kind: "presentation",
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: "sug-improve",
      title: "Îmbunătățește materialul activ",
      reason: "PRIMA cunoaște disciplina, clasa și artefactele din acest proiect.",
      actionLabel: "Deschide PRIMA",
      href: `/create/experience?project=${project.id}`,
      kind: "general",
    });
  }

  return suggestions;
}

/**
 * Simulate a Core-aware generate step: Prompt must be project-scoped,
 * then artifact is stored with AI actor + activity + version.
 */
export function generateArtifactInProject(input: {
  project: Project;
  kind: ArtifactKind;
  title: string;
  intent: string;
  activeTab: ProjectWorkspaceTabId;
}): { artifactId: string; coreContext: ProjectCoreContext } {
  const coreContext = buildProjectCoreContext({
    project: input.project,
    activeTab: input.activeTab,
    intent: input.intent,
  });

  // Prompt Builder contract shape (canonical) — no free-floating prompt
  const promptPackage = {
    system: "PRIMA educational assistant — project scoped",
    user: [
      `Project: ${coreContext.projectTitle}`,
      `Subject: ${coreContext.subject}`,
      `Grade: ${coreContext.grade}`,
      coreContext.curriculumRef
        ? `Curriculum: ${coreContext.curriculumRef}`
        : null,
      `Intent: ${coreContext.intent}`,
    ]
      .filter(Boolean)
      .join("\n"),
  };

  const unit = projectWorkspaceRepository.ensureDefaultUnit(input.project.id);
  const artifact = projectWorkspaceRepository.createArtifact({
    projectId: input.project.id,
    kind: input.kind,
    title: input.title,
    unitId: unit.id,
    createdBy: "ai",
    payload: {
      generated: true,
      promptPackage,
      content: `Schiță generată pentru ${input.title}`,
      objectives: ["Obiectiv didactic principal"],
    },
    tags: ["ai-generated", input.kind],
  });

  projectWorkspaceRepository.addActivity({
    projectId: input.project.id,
    kind: "ai_action",
    title: "PRIMA a generat un artefact",
    detail: `${input.kind} · context proiect ${input.project.id}`,
    actor: "ai",
    artifactId: artifact.id,
  });

  projectWorkspaceRepository.addActivity({
    projectId: input.project.id,
    kind: "validation",
    title: "Validare preliminară",
    detail: "Artefact marcat draft — publicarea cere Validation Engine.",
    actor: "system",
    artifactId: artifact.id,
  });

  return { artifactId: artifact.id, coreContext };
}

export function exportArtifact(projectId: string, artifactId: string): string {
  const artifact = projectWorkspaceRepository.getArtifact(artifactId);
  if (!artifact || artifact.projectId !== projectId) {
    throw new Error("Artifact must belong to the current project");
  }
  const uri = `memory://exports/${projectId}/${artifactId}.pdf`;
  projectWorkspaceRepository.addActivity({
    projectId,
    kind: "export",
    title: `Export: ${artifact.title}`,
    detail: uri,
    actor: "teacher",
    artifactId,
  });
  return uri;
}
