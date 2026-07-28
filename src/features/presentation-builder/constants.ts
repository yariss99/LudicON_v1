import type {
  PresentationAiActionId,
  PresentationKind,
  PresentationSectionId,
  PresentationSourceKind,
  PresentationTheme,
  PresentationThemeId,
  SlideType,
} from "./types";

export const PRESENTATION_KINDS: readonly {
  id: PresentationKind;
  label: string;
}[] = [
  { id: "lesson", label: "Prezentare de lecție" },
  { id: "interactive_lesson", label: "Lecție interactivă" },
  { id: "teacher", label: "Prezentare profesor" },
  { id: "student", label: "Prezentare elev" },
  { id: "project", label: "Prezentare proiect" },
  { id: "science_investigation", label: "Investigație științifică" },
  { id: "historical_timeline", label: "Timeline istoric" },
  { id: "mathematics", label: "Explicație matematică" },
  { id: "story", label: "Prezentare din poveste" },
  { id: "revision", label: "Prezentare de recapitulare" },
] as const;

export const SLIDE_TYPES: readonly { id: SlideType; label: string }[] = [
  { id: "title", label: "Titlu" },
  { id: "objectives", label: "Obiective" },
  { id: "introduction", label: "Introducere" },
  { id: "explanation", label: "Explicație" },
  { id: "diagram", label: "Diagramă" },
  { id: "image", label: "Imagine" },
  { id: "video", label: "Video" },
  { id: "timeline", label: "Timeline" },
  { id: "activity", label: "Activitate" },
  { id: "question", label: "Întrebare" },
  { id: "discussion", label: "Discuție" },
  { id: "reflection", label: "Reflecție" },
  { id: "assessment", label: "Evaluare" },
  { id: "summary", label: "Rezumat" },
  { id: "homework", label: "Temă" },
] as const;

export const SOURCE_KINDS: readonly {
  id: PresentationSourceKind;
  label: string;
}[] = [
  { id: "project", label: "Din proiect" },
  { id: "lesson", label: "Din lecție" },
  { id: "story", label: "Din poveste" },
  { id: "worksheet", label: "Din fișă" },
  { id: "assessment", label: "Din evaluare" },
  { id: "template", label: "Din șablon" },
] as const;

export const THEMES: readonly PresentationTheme[] = [
  {
    id: "atelier_calm",
    name: "Atelier calm",
    background: "#f7f8fa",
    surface: "#ffffff",
    accent: "#1d4ed8",
    text: "#0f172a",
    fontDisplay: "Source Serif 4",
  },
  {
    id: "chalkboard",
    name: "Tablă",
    background: "#1f2937",
    surface: "#274055",
    accent: "#fbbf24",
    text: "#f8fafc",
    fontDisplay: "Source Serif 4",
  },
  {
    id: "science_lab",
    name: "Laborator",
    background: "#ecfeff",
    surface: "#ffffff",
    accent: "#0f766e",
    text: "#134e4a",
    fontDisplay: "DM Sans",
  },
  {
    id: "storybook",
    name: "Poveste",
    background: "#fff7ed",
    surface: "#ffffff",
    accent: "#c2410c",
    text: "#1c1917",
    fontDisplay: "Source Serif 4",
  },
  {
    id: "high_contrast",
    name: "Contrast ridicat",
    background: "#000000",
    surface: "#111111",
    accent: "#fde047",
    text: "#ffffff",
    fontDisplay: "DM Sans",
  },
] as const;

export const THEME_BY_ID: Record<PresentationThemeId, PresentationTheme> =
  Object.fromEntries(THEMES.map((t) => [t.id, t])) as Record<
    PresentationThemeId,
    PresentationTheme
  >;

export const PRESENTATION_SECTIONS: readonly {
  id: PresentationSectionId;
  label: string;
}[] = [
  { id: "general", label: "General" },
  { id: "source", label: "Sursă PRIMA" },
  { id: "outline", label: "Outline" },
  { id: "slides", label: "Slide-uri" },
  { id: "theme", label: "Teme" },
  { id: "notes", label: "Note vorbitor" },
  { id: "media", label: "Multimedia" },
  { id: "preview", label: "Preview" },
  { id: "presenter", label: "Presenter Mode" },
  { id: "export", label: "Export" },
  { id: "metadata", label: "Metadate" },
] as const;

export const AI_ACTIONS: readonly {
  id: PresentationAiActionId;
  label: string;
  description: string;
}[] = [
  {
    id: "generate_entire",
    label: "Generează prezentarea",
    description: "Slide-uri complete din sursa selectată.",
  },
  {
    id: "generate_slides",
    label: "Generează slide-uri",
    description: "Adaugă slide-uri tipizate.",
  },
  {
    id: "improve_slides",
    label: "Îmbunătățește slide-urile",
    description: "Claritate, ritm, lizibilitate.",
  },
  {
    id: "summarize_lesson",
    label: "Rezumă lecția",
    description: "Transformă lecția în outline scurt.",
  },
  {
    id: "generate_speaker_notes",
    label: "Note vorbitor",
    description: "Completează speaker notes pe slide-uri.",
  },
  {
    id: "generate_diagrams",
    label: "Diagrame",
    description: "Sugestii / slide-uri diagramă.",
  },
  {
    id: "generate_visual_suggestions",
    label: "Sugestii vizuale",
    description: "Prompturi imagine / icon / chart.",
  },
  {
    id: "generate_animation_suggestions",
    label: "Sugestii animații",
    description: "Animații discrete pe slide-uri.",
  },
  {
    id: "adapt_presentation",
    label: "Adaptează",
    description: "Ajustează pentru clasă / tip prezentare.",
  },
  {
    id: "translate_presentation",
    label: "Tradu (RO↔EN sketch)",
    description: "Variantă bilingvă scurtă pe note.",
  },
] as const;

export const AUTOSAVE_DELAY_MS = 900;
