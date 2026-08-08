import { wizardPath } from "../../universal-creation-wizard/constants";
import type { WorkspaceResourceItem } from "./workspaceInventory";

export type WorkspaceRecommendation = {
  id: string;
  title: string;
  detail: string;
  actionLabel: string;
  href: string;
};

/** Contextual recommendations following the teaching flow sequence. */
export function buildWorkspaceRecommendations(
  projectId: string,
  inventory: WorkspaceResourceItem[],
): WorkspaceRecommendation[] {
  const lessons = inventory.filter((i) => i.kind === "lesson");
  const worksheets = inventory.filter((i) => i.kind === "worksheet");
  const assessments = inventory.filter((i) => i.kind === "assessment");
  const games = inventory.filter((i) => i.kind === "game");
  const stories = inventory.filter((i) => i.kind === "story");
  const presentations = inventory.filter((i) => i.kind === "presentation");
  const out: WorkspaceRecommendation[] = [];
  const lastLesson = lessons[0];

  if (lessons.length === 0) {
    out.push({
      id: "need-lesson",
      title: "Create your first lesson",
      detail: "Start the teaching flow with a lesson.",
      actionLabel: "Create Lesson",
      href: wizardPath({ type: "lesson", projectId, source: "blank" }),
    });
    return out;
  }

  if (worksheets.length === 0) {
    out.push({
      id: "lesson-no-worksheet",
      title: "Last lesson has no worksheet",
      detail: `“${lastLesson.title}” is ready for practice materials.`,
      actionLabel: "Create Worksheet",
      href: wizardPath({
        type: "worksheet",
        projectId,
        source: "lesson",
        sourceId: lastLesson.id,
        title: `${lastLesson.title} — Worksheet`,
        subject: lastLesson.meta?.split(" · ")[0],
        grade: lastLesson.meta?.split(" · ")[1],
      }),
    });
  }

  if (worksheets.length > 0 && presentations.length === 0) {
    out.push({
      id: "need-presentation",
      title: "Add a presentation",
      detail: "Continue the flow with slides for whole-class teaching.",
      actionLabel: "Create Presentation",
      href: wizardPath({
        type: "presentation",
        projectId,
        source: "lesson",
        sourceId: lastLesson.id,
      }),
    });
  }

  if (presentations.length > 0 && assessments.length === 0) {
    out.push({
      id: "need-assessment",
      title: "Add an assessment",
      detail: "Check understanding after teaching and practice.",
      actionLabel: "Create Assessment",
      href: wizardPath({ type: "assessment", projectId, source: "worksheet" }),
    });
  }

  if (assessments.length > 0 && games.length === 0) {
    out.push({
      id: "need-game",
      title: "Project has no game",
      detail: "Assessment is ready — create a classroom game next.",
      actionLabel: "Create Game",
      href: wizardPath({ type: "game", projectId, source: "worksheet" }),
    });
  }

  if (games.length > 0 && stories.length === 0) {
    out.push({
      id: "need-story",
      title: "Project has no story",
      detail: "Complete the teaching flow with an interactive narrative.",
      actionLabel: "Create Story",
      href: wizardPath({ type: "story", projectId, source: "game" }),
    });
  }

  return out.slice(0, 5);
}
