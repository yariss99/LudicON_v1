import type { ArtifactKind, ProjectWorkspaceTabId } from "./types";

export const WORKSPACE_TABS: readonly {
  id: ProjectWorkspaceTabId;
  label: string;
}[] = [
  { id: "overview", label: "Prezentare" },
  { id: "lessons", label: "Lecții" },
  { id: "worksheets", label: "Fișe" },
  { id: "assessments", label: "Evaluări" },
  { id: "stories", label: "Povești" },
  { id: "games", label: "Jocuri" },
  { id: "presentations", label: "Prezentări" },
  { id: "resources", label: "Resurse" },
  { id: "ai", label: "Sugestii PRIMA" },
  { id: "versions", label: "Versiuni" },
  { id: "activity", label: "Activitate" },
  { id: "settings", label: "Setări" },
] as const;

export const ARTIFACT_KIND_LABEL: Record<string, string> = {
  lesson: "Lecție",
  worksheet: "Fișă",
  assessment: "Evaluare",
  story: "Poveste",
  game: "Joc",
  presentation: "Prezentare",
  resource: "Resursă",
  note: "Notă",
  unit: "Unitate",
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
