import type { ProjectColorId, ProjectIconId } from "../../types/project";

export const PROJECT_SUBJECTS = [
  "Matematică",
  "Limba română",
  "Științe",
  "Istorie",
  "Geografie",
  "Educație plastică",
  "Educație muzicală",
  "Limba engleză",
  "Educație civică",
  "Alte discipline",
] as const;

export const PROJECT_GRADES = [
  "Clasa pregătitoare",
  "Clasa I",
  "Clasa a II-a",
  "Clasa a III-a",
  "Clasa a IV-a",
  "Clasa a V-a",
  "Clasa a VI-a",
  "Clasa a VII-a",
  "Clasa a VIII-a",
] as const;

export type ProjectColorOption = {
  id: ProjectColorId;
  label: string;
  swatch: string;
  soft: string;
  text: string;
};

export const PROJECT_COLORS: readonly ProjectColorOption[] = [
  {
    id: "blue",
    label: "Albastru",
    swatch: "#2563EB",
    soft: "bg-blue-50",
    text: "text-blue-700",
  },
  {
    id: "indigo",
    label: "Indigo",
    swatch: "#4F46E5",
    soft: "bg-indigo-50",
    text: "text-indigo-700",
  },
  {
    id: "sky",
    label: "Cer",
    swatch: "#0284C7",
    soft: "bg-sky-50",
    text: "text-sky-700",
  },
  {
    id: "teal",
    label: "Turcoaz",
    swatch: "#0D9488",
    soft: "bg-teal-50",
    text: "text-teal-700",
  },
  {
    id: "emerald",
    label: "Smaragd",
    swatch: "#059669",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    id: "amber",
    label: "Chihlimbar",
    swatch: "#D97706",
    soft: "bg-amber-50",
    text: "text-amber-800",
  },
  {
    id: "rose",
    label: "Roz",
    swatch: "#E11D48",
    soft: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "#7C3AED",
    soft: "bg-violet-50",
    text: "text-violet-700",
  },
] as const;

export const PROJECT_ICON_IDS: readonly ProjectIconId[] = [
  "book",
  "flask",
  "globe",
  "palette",
  "calculator",
  "music",
  "landmark",
  "atom",
  "pen",
  "lightbulb",
] as const;

export const DEFAULT_PROJECT_COLOR: ProjectColorId = "blue";
export const DEFAULT_PROJECT_ICON: ProjectIconId = "book";

export function getProjectColor(color: ProjectColorId): ProjectColorOption {
  return (
    PROJECT_COLORS.find((option) => option.id === color) ?? PROJECT_COLORS[0]
  );
}
