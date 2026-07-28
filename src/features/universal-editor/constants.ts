import type { UpeBlockType, UpeBottomTab, UpeLeftTab, UpePreviewMode, UpeRightTab } from "./types";

export const UPE_TITLE = "Editor pedagogic";

export const LEFT_TABS: Array<{ id: UpeLeftTab; label: string }> = [
  { id: "objects", label: "Materiale" },
  { id: "structure", label: "Structură" },
  { id: "library", label: "Bibliotecă" },
  { id: "templates", label: "Șabloane" },
  { id: "media", label: "Media" },
];

export const RIGHT_TABS: Array<{ id: UpeRightTab; label: string }> = [
  { id: "properties", label: "Proprietăți" },
  { id: "pedagogy", label: "Pedagogie" },
  { id: "design", label: "Aspect" },
  { id: "accessibility", label: "Accesibilitate" },
  { id: "alignment", label: "Aliniere" },
  { id: "recommendations", label: "PRIMA" },
];

export const BOTTOM_TABS: Array<{ id: UpeBottomTab; label: string }> = [
  { id: "validation", label: "Validare" },
  { id: "history", label: "Istoric" },
  { id: "export", label: "Export" },
  { id: "compare", label: "Compară" },
  { id: "comments", label: "Comentarii" },
];

export const PREVIEW_MODES: Array<{ id: UpePreviewMode; label: string }> = [
  { id: "student", label: "Elev" },
  { id: "printable", label: "Print" },
  { id: "presentation", label: "Prezentare" },
  { id: "mobile", label: "Mobil" },
  { id: "interactive", label: "Interactiv" },
  { id: "accessibility", label: "Accesibilitate" },
];

export const INSERTABLE_BLOCKS: Array<{ type: UpeBlockType; label: string }> = [
  { type: "heading", label: "Titlu" },
  { type: "paragraph", label: "Paragraf" },
  { type: "exercise", label: "Exercițiu" },
  { type: "open_question", label: "Întrebare deschisă" },
  { type: "hint", label: "Indiciu" },
  { type: "success_criteria", label: "Criterii de succes" },
  { type: "teacher_note", label: "Notă profesor" },
  { type: "reflection", label: "Reflecție" },
  { type: "divider", label: "Separator" },
];

export const BLOCK_LABELS: Record<string, string> = {
  heading: "Titlu",
  paragraph: "Paragraf",
  exercise: "Exercițiu",
  open_question: "Întrebare deschisă",
  hint: "Indiciu",
  teacher_note: "Notă profesor",
  success_criteria: "Criterii de succes",
  reflection: "Reflecție",
  divider: "Separator",
  image: "Imagine",
  interactive: "Interactiv",
};
