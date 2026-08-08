import type { ArtifactKind, ProjectWorkspaceTabId } from "./types";

export const WORKSPACE_TABS: readonly {
  id: ProjectWorkspaceTabId;
  label: string;
}[] = [
  { id: "overview", label: "Overview" },
  { id: "lessons", label: "Lessons" },
  { id: "worksheets", label: "Worksheets" },
  { id: "assessments", label: "Assessments" },
  { id: "games", label: "Games" },
  { id: "stories", label: "Stories" },
  { id: "presentations", label: "Presentations" },
  { id: "resources", label: "Resources" },
  { id: "classroom", label: "Classroom" },
  { id: "analytics", label: "Analytics" },
] as const;

export const ARTIFACT_KIND_LABEL: Record<string, string> = {
  lesson: "Lesson",
  worksheet: "Worksheet",
  assessment: "Assessment",
  story: "Story",
  game: "Game",
  presentation: "Presentation",
  resource: "Resource",
  note: "Note",
  unit: "Unit",
};

export const TAB_TO_KIND: Partial<
  Record<ProjectWorkspaceTabId, ArtifactKind>
> = {
  lessons: "lesson",
  worksheets: "worksheet",
  assessments: "assessment",
  stories: "story",
  games: "game",
  presentations: "presentation",
  resources: "resource",
};
