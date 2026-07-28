import type { ProjectState } from "../types/project";

/** User-facing lesson status labels (UI only). */
export type ExperienceStatusLabel =
  | "Ciornă"
  | "În pregătire"
  | "De verificat"
  | "Finalizată";

export function experienceStatusLabel(state: ProjectState): ExperienceStatusLabel {
  switch (state) {
    case "blueprint_review":
      return "De verificat";
    case "approved":
    case "resources_ready":
      return "Finalizată";
    case "conversation":
    default:
      return "Ciornă";
  }
}
