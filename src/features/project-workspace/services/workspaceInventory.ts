import { lessonStudioRepository } from "../../lesson-studio/services/lessonStudioRepository";
import { worksheetStudioRepository } from "../../worksheet-studio/services/worksheetStudioRepository";
import { assessmentStudioRepository } from "../../assessment-studio/services/assessmentStudioRepository";
import { presentationStudioRepository } from "../../presentation-studio/services/presentationStudioRepository";
import { gameStudioRepository } from "../../game-studio/services/gameStudioRepository";
import { storyStudioRepository } from "../../story-studio/services/storyStudioRepository";
import { openLessonPath } from "../../lesson-studio/LessonStudioPage";
import { openWorksheetPath } from "../../worksheet-studio/WorksheetStudioPage";
import { openAssessmentPath } from "../../assessment-studio/AssessmentStudioPage";
import { openPresentationPath } from "../../presentation-studio/PresentationStudioPage";
import { openGamePath } from "../../game-studio/GameStudioPage";
import { openStoryPath } from "../../story-studio/StoryStudioPage";
import type { WizardResourceType } from "../../universal-creation-wizard/types";

export type WorkspaceResourceKind = WizardResourceType;

export type WorkspaceResourceItem = {
  id: string;
  kind: WorkspaceResourceKind;
  title: string;
  createdAt: string;
  updatedAt: string;
  href: string;
  meta?: string;
};

export type ResourceKindSummary = {
  kind: WorkspaceResourceKind;
  label: string;
  emoji: string;
  description: string;
  tabHref: string;
  count: number;
  items: WorkspaceResourceItem[];
};

const KIND_META: Record<
  WorkspaceResourceKind,
  { label: string; emoji: string; description: string; tab: string }
> = {
  lesson: {
    label: "Lessons",
    emoji: "📘",
    description: "Teaching sequences and objectives",
    tab: "lessons",
  },
  worksheet: {
    label: "Worksheets",
    emoji: "📄",
    description: "Practice materials for students",
    tab: "worksheets",
  },
  assessment: {
    label: "Assessments",
    emoji: "✅",
    description: "Checks for understanding",
    tab: "assessments",
  },
  presentation: {
    label: "Presentations",
    emoji: "🎞",
    description: "Slides for whole-class teaching",
    tab: "presentations",
  },
  game: {
    label: "Games",
    emoji: "🎮",
    description: "Curriculum-aligned challenges",
    tab: "games",
  },
  story: {
    label: "Stories",
    emoji: "📖",
    description: "Interactive learning narratives",
    tab: "stories",
  },
};

/** Live inventory from studio LocalStorage repositories. */
export function buildWorkspaceInventory(
  projectId: string,
): WorkspaceResourceItem[] {
  const items: WorkspaceResourceItem[] = [];

  for (const d of lessonStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "lesson",
      title: d.properties.title || "Untitled lesson",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openLessonPath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }
  for (const d of worksheetStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "worksheet",
      title: d.properties.title || "Untitled worksheet",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openWorksheetPath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }
  for (const d of assessmentStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "assessment",
      title: d.properties.title || "Untitled assessment",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openAssessmentPath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }
  for (const d of presentationStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "presentation",
      title: d.properties.title || "Untitled presentation",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openPresentationPath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }
  for (const d of gameStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "game",
      title: d.properties.title || "Untitled game",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openGamePath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }
  for (const d of storyStudioRepository.listByProject(projectId)) {
    items.push({
      id: d.id,
      kind: "story",
      title: d.properties.title || "Untitled story",
      createdAt: d.createdAt,
      updatedAt: d.updatedAt,
      href: openStoryPath(projectId, d.id, "guided", d.guidedCompleted),
      meta: [d.properties.subject, d.properties.grade].filter(Boolean).join(" · "),
    });
  }

  return items.sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  );
}

export function summarizeByKind(
  projectId: string,
  inventory: WorkspaceResourceItem[],
): ResourceKindSummary[] {
  const base = `/studio/${projectId}`;
  const kinds = Object.keys(KIND_META) as WorkspaceResourceKind[];
  return kinds.map((kind) => {
    const meta = KIND_META[kind];
    const items = inventory.filter((i) => i.kind === kind);
    return {
      kind,
      label: meta.label,
      emoji: meta.emoji,
      description: meta.description,
      tabHref: `${base}/${meta.tab}`,
      count: items.length,
      items,
    };
  });
}

export function filterInventory(
  inventory: WorkspaceResourceItem[],
  query: string,
): WorkspaceResourceItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return inventory;
  return inventory.filter(
    (item) =>
      item.title.toLowerCase().includes(q) ||
      item.kind.includes(q) ||
      (item.meta?.toLowerCase().includes(q) ?? false),
  );
}
