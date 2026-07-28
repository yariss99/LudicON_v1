import type {
  ReadingLevel,
  SceneType,
  StoryAiActionId,
  StoryKind,
  StorySectionId,
} from "./types";

export const STORY_KINDS: readonly { id: StoryKind; label: string }[] = [
  { id: "narrative", label: "Poveste narativă" },
  { id: "interactive", label: "Poveste interactivă" },
  { id: "adventure", label: "Alege-ți aventura" },
  { id: "stem", label: "Poveste STEM" },
  { id: "historical", label: "Poveste istorică" },
  { id: "scientific", label: "Poveste științifică" },
  { id: "mathematics", label: "Poveste de matematică" },
  { id: "language", label: "Poveste de limbă" },
  { id: "social_emotional", label: "Poveste socio-emoțională" },
  { id: "digital_storybook", label: "Carte digitală" },
] as const;

export const SCENE_TYPES: readonly { id: SceneType; label: string }[] = [
  { id: "introduction", label: "Introducere" },
  { id: "dialogue", label: "Dialog" },
  { id: "challenge", label: "Provocare" },
  { id: "puzzle", label: "Puzzle" },
  { id: "decision", label: "Punct de decizie" },
  { id: "exploration", label: "Explorare" },
  { id: "mini_game", label: "Mini-joc" },
  { id: "reflection", label: "Reflecție" },
  { id: "assessment", label: "Moment de evaluare" },
  { id: "ending", label: "Final" },
] as const;

export const READING_LEVELS: readonly { id: ReadingLevel; label: string }[] = [
  { id: "emerging", label: "Începător" },
  { id: "developing", label: "În dezvoltare" },
  { id: "fluent", label: "Fluent" },
  { id: "advanced", label: "Avansat" },
] as const;

export const STORY_SECTIONS: readonly {
  id: StorySectionId;
  label: string;
}[] = [
  { id: "general", label: "General" },
  { id: "characters", label: "Personaje" },
  { id: "setting", label: "Cadru" },
  { id: "objectives", label: "Obiective" },
  { id: "arc", label: "Arc narativ" },
  { id: "scenes", label: "Scene" },
  { id: "branching", label: "Ramificații" },
  { id: "activities", label: "Activități" },
  { id: "reflection", label: "Reflecție" },
  { id: "assessment", label: "Momente de evaluare" },
  { id: "notes", label: "Note profesor" },
  { id: "metadata", label: "Metadate" },
  { id: "preview", label: "Previzualizare" },
  { id: "export", label: "Export" },
] as const;

export const AI_ACTIONS: readonly {
  id: StoryAiActionId;
  label: string;
  description: string;
}[] = [
  {
    id: "generate_story",
    label: "Generează povestea",
    description: "Arc, personaje și scene aliniate la lecție.",
  },
  {
    id: "generate_characters",
    label: "Generează personaje",
    description: "Personaje cu roluri pedagogice clare.",
  },
  {
    id: "generate_dialogues",
    label: "Generează dialoguri",
    description: "Dialoguri pe scenele existente.",
  },
  {
    id: "generate_scenes",
    label: "Generează scene",
    description: "Completează arcul cu scene tipizate.",
  },
  {
    id: "generate_challenges",
    label: "Provocări educaționale",
    description: "Challenge / puzzle / assessment moments.",
  },
  {
    id: "adapt_grade",
    label: "Adaptează pentru clasă",
    description: "Ajustează tonul și complexitatea la clasă.",
  },
  {
    id: "adjust_reading_level",
    label: "Ajustează nivelul de lectură",
    description: "Simplifică sau ridică vocabularul.",
  },
  {
    id: "differentiate",
    label: "Diferențiază povestea",
    description: "Suport și extensii pentru ritmuri diferite.",
  },
  {
    id: "generate_illustration_prompts",
    label: "Prompturi ilustrații",
    description: "Prompturi vizuale pe scene și personaje.",
  },
  {
    id: "generate_audio_script",
    label: "Script narațiune audio",
    description: "Text pentru narare pe scene.",
  },
] as const;

export const AUTOSAVE_DELAY_MS = 900;
