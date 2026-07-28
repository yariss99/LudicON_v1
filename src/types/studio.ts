import type { LucideIcon } from "lucide-react";
import type { ProjectFormInput, ProjectResource } from "./project";

export type StudioPhase = "compose" | "intent" | "planning" | "ready";

export type StudioSuggestionId =
  | "lesson"
  | "worksheet"
  | "presentation"
  | "assessment"
  | "game"
  | "scenario"
  | "story"
  | "parent";

/** Artifacts proposed in the Intent Panel — teacher can remove any */
export type IntentArtifactId =
  | "lesson"
  | "activities"
  | "worksheet"
  | "assessment"
  | "presentation";

export type IntentArtifact = {
  id: IntentArtifactId;
  label: string;
  description: string;
  included: boolean;
};

export type StudioSuggestion = {
  id: StudioSuggestionId;
  label: string;
  prompt: string;
  icon: LucideIcon;
};

export type ParsedStudioIntent = {
  prompt: string;
  title: string;
  subject: string;
  grade: string;
  description: string;
  color: ProjectFormInput["color"];
  icon: ProjectFormInput["icon"];
  suggestionId?: StudioSuggestionId;
  artifacts: IntentArtifactId[];
};

export type PlanningStep = {
  id: string;
  label: string;
  emoji: string;
};

export type StudioAiAction = {
  id: string;
  label: string;
  description: string;
};

export type StudioResourceBlueprint = ProjectResource;
