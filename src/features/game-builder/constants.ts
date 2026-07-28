import type {
  ChallengeType,
  GameAiActionId,
  GameKind,
  GameMechanicId,
  GameSectionId,
  GameSourceKind,
} from "./types";

export const GAME_KINDS: readonly { id: GameKind; label: string }[] = [
  { id: "quiz", label: "Quiz" },
  { id: "escape_room", label: "Escape Room" },
  { id: "memory", label: "Memory" },
  { id: "matching", label: "Potrivire" },
  { id: "drag_drop", label: "Drag & Drop" },
  { id: "treasure_hunt", label: "Vânătoare de comori" },
  { id: "mission", label: "Învățare pe misiuni" },
  { id: "adventure", label: "Aventură" },
  { id: "board", label: "Joc de masă" },
  { id: "card", label: "Joc de cărți" },
  { id: "puzzle", label: "Puzzle" },
  { id: "timeline", label: "Timeline" },
  { id: "classification", label: "Clasificare" },
  { id: "math_challenge", label: "Provocare matematică" },
  { id: "language_challenge", label: "Provocare de limbă" },
  { id: "science_investigation", label: "Investigație științifică" },
  { id: "collaborative", label: "Joc colaborativ de clasă" },
] as const;

export const SOURCE_KINDS: readonly { id: GameSourceKind; label: string }[] = [
  { id: "lesson", label: "Din lecție" },
  { id: "worksheet", label: "Din fișă" },
  { id: "assessment", label: "Din evaluare" },
  { id: "story", label: "Din poveste" },
  { id: "competencies", label: "Din competențe" },
  { id: "objectives", label: "Din obiective" },
  { id: "template", label: "Din șablon mecanici" },
] as const;

export const MECHANICS_LIBRARY: readonly {
  id: GameMechanicId;
  label: string;
  defaultValue: number;
  description: string;
}[] = [
  { id: "points", label: "Puncte", defaultValue: 100, description: "Scor acumulat pe provocări." },
  { id: "badges", label: "Insigne", defaultValue: 3, description: "Recompense vizuale pe obiective." },
  { id: "stars", label: "Stele", defaultValue: 3, description: "Performanță pe nivel." },
  { id: "experience", label: "Experiență (XP)", defaultValue: 50, description: "Progres pe termen lung." },
  { id: "lives", label: "Vieți", defaultValue: 3, description: "Încercări înainte de reset." },
  { id: "levels", label: "Nivele", defaultValue: 3, description: "Progresie pe etape." },
  { id: "unlockables", label: "Deblocări", defaultValue: 2, description: "Conținut după praguri." },
  { id: "achievements", label: "Achievement-uri", defaultValue: 4, description: "Momente speciale." },
  { id: "random_events", label: "Evenimente aleatoare", defaultValue: 1, description: "Surprize controlate pedagogic." },
  { id: "progress", label: "Urmărire progres", defaultValue: 1, description: "Bară / checklist vizibil." },
  { id: "adaptive_difficulty", label: "Dificultate adaptivă", defaultValue: 1, description: "Ajustează pe răspunsuri." },
] as const;

export const CHALLENGE_TYPES: readonly { id: ChallengeType; label: string }[] = [
  { id: "question", label: "Întrebare" },
  { id: "puzzle", label: "Puzzle" },
  { id: "task", label: "Sarcină" },
  { id: "decision", label: "Decizie" },
  { id: "timed", label: "Cronometrat" },
  { id: "collaborative", label: "Colaborativ" },
  { id: "boss", label: "Provocare finală" },
] as const;

export const GAME_SECTIONS: readonly { id: GameSectionId; label: string }[] = [
  { id: "general", label: "Informații joc" },
  { id: "source", label: "Sursă PRIMA" },
  { id: "objectives", label: "Obiective" },
  { id: "competencies", label: "Competențe" },
  { id: "rules", label: "Reguli" },
  { id: "mechanics", label: "Mecanici" },
  { id: "levels", label: "Nivele" },
  { id: "challenges", label: "Provocări" },
  { id: "questions", label: "Întrebări" },
  { id: "rewards", label: "Recompense" },
  { id: "hints", label: "Indicii" },
  { id: "feedback", label: "Feedback" },
  { id: "notes", label: "Note profesor" },
  { id: "metadata", label: "Metadate" },
  { id: "preview", label: "Preview" },
  { id: "simulate", label: "Simulare" },
  { id: "export", label: "Export" },
] as const;

export const AI_ACTIONS: readonly {
  id: GameAiActionId;
  label: string;
  description: string;
}[] = [
  { id: "generate_complete", label: "Generează jocul complet", description: "Structură + mecanici din sursa selectată." },
  { id: "from_lesson", label: "Din lecție", description: "Transformă lecția în provocări de joc." },
  { id: "from_worksheet", label: "Din fișă", description: "Convertește itemii fișei în challenges." },
  { id: "from_story", label: "Din poveste", description: "Scenele devin misiuni / aventură." },
  { id: "from_assessment", label: "Din evaluare", description: "Itemii de evaluare → quiz / escape." },
  { id: "generate_questions", label: "Generează întrebări", description: "Adaugă întrebări aliniate obiectivelor." },
  { id: "generate_challenges", label: "Generează provocări", description: "Completează nivelele cu challenges." },
  { id: "generate_puzzles", label: "Generează puzzle-uri", description: "Adaugă puzzle-uri pe nivele." },
  { id: "generate_rewards", label: "Generează recompense", description: "Badges, stars, unlockables." },
  { id: "balance_difficulty", label: "Echilibrează dificultatea", description: "Easy / medium / hard pe provocări." },
  { id: "adapt_grade", label: "Adaptează la clasă", description: "Ton și complexitate pentru grad." },
  { id: "generate_visual_prompts", label: "Prompturi vizuale", description: "Asset prompts pentru UI joc." },
] as const;

export const AUTOSAVE_DELAY_MS = 900;
