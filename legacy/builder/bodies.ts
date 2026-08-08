import { z } from "zod";

/**
 * The five document bodies.
 *
 * Everything the old per-type documents shared — id, projectId, title, subject,
 * grade, status, version, validation, timestamps, actor — now lives in
 * `DocumentEnvelope`. What remains here is the genuinely per-type content, which
 * is the only thing that ever justified five separate builders.
 */

/** Present in every body: the pedagogical spine. */
const CommonBody = z.object({
  objectives: z.array(z.string()).default([]),
  competencies: z.array(z.string()).default([]),
  teacherNotes: z.string().default(""),
});

/* ---------------------------------------------------------------- lesson */

export const LessonPhase = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  durationMinutes: z.number().int().nonnegative(),
});
export type LessonPhase = z.infer<typeof LessonPhase>;

export const LessonBody = CommonBody.extend({
  durationMinutes: z.number().int().nonnegative().default(50),
  prerequisites: z.array(z.string()).default([]),
  resources: z.array(z.string()).default([]),
  phases: z.array(LessonPhase).default([]),
  differentiation: z.string().default(""),
  assessment: z.string().default(""),
  homework: z.string().default(""),
  reflection: z.string().default(""),
});
export type LessonBody = z.infer<typeof LessonBody>;

/** The seven phases the old `LESSON_PHASES` table defined, minutes included. */
export const LESSON_PHASE_TEMPLATE: readonly Omit<LessonPhase, "content">[] = [
  { id: "warmup", title: "Captarea atenției", durationMinutes: 3 },
  { id: "recall", title: "Reactualizarea cunoștințelor", durationMinutes: 5 },
  { id: "teaching", title: "Predarea noului conținut", durationMinutes: 12 },
  { id: "practice", title: "Practică ghidată", durationMinutes: 12 },
  { id: "independent", title: "Practică independentă", durationMinutes: 5 },
  { id: "closure", title: "Încheiere", durationMinutes: 4 },
  { id: "extension", title: "Extindere", durationMinutes: 4 },
];

/* ------------------------------------------------------------ assessment */

export const QUESTION_TYPES = [
  "single_choice",
  "multiple_choice",
  "true_false",
  "short_answer",
  "essay",
  "matching",
] as const;
export const QuestionType = z.enum(QUESTION_TYPES);
export type QuestionType = z.infer<typeof QuestionType>;

export const QUESTION_TYPE_LABEL: Readonly<Record<QuestionType, string>> =
  Object.freeze({
    single_choice: "Alegere unică",
    multiple_choice: "Alegere multiplă",
    true_false: "Adevărat / Fals",
    short_answer: "Răspuns scurt",
    essay: "Răspuns dezvoltat",
    matching: "Asociere",
  });

export const DIFFICULTIES = ["easy", "medium", "hard"] as const;
export const Difficulty = z.enum(DIFFICULTIES);
export type Difficulty = z.infer<typeof Difficulty>;

export const DIFFICULTY_LABEL: Readonly<Record<Difficulty, string>> =
  Object.freeze({ easy: "Accesibil", medium: "Mediu", hard: "Provocator" });

export const AssessmentQuestion = z.object({
  id: z.string(),
  type: QuestionType,
  prompt: z.string(),
  choices: z.array(z.string()).default([]),
  answerKey: z.string().default(""),
  points: z.number().int().nonnegative().default(1),
  difficulty: Difficulty.default("medium"),
});
export type AssessmentQuestion = z.infer<typeof AssessmentQuestion>;

export const QuestionGroup = z.object({
  id: z.string(),
  title: z.string(),
  instructions: z.string().default(""),
  questions: z.array(AssessmentQuestion).default([]),
});
export type QuestionGroup = z.infer<typeof QuestionGroup>;

export const AssessmentBody = CommonBody.extend({
  durationMinutes: z.number().int().nonnegative().default(30),
  criteria: z.array(z.string()).default([]),
  groups: z.array(QuestionGroup).default([]),
  passingScore: z.number().int().nonnegative().default(50),
});
export type AssessmentBody = z.infer<typeof AssessmentBody>;

/* ----------------------------------------------------------------- story */

export const SCENE_TYPES = [
  "introduction",
  "development",
  "challenge",
  "decision",
  "ending",
] as const;
export const SceneType = z.enum(SCENE_TYPES);
export type SceneType = z.infer<typeof SceneType>;

export const SCENE_TYPE_LABEL: Readonly<Record<SceneType, string>> =
  Object.freeze({
    introduction: "Introducere",
    development: "Desfășurare",
    challenge: "Provocare",
    decision: "Alegere",
    ending: "Final",
  });

export const READING_LEVELS = [
  "emerging",
  "developing",
  "confident",
  "advanced",
] as const;
export const ReadingLevel = z.enum(READING_LEVELS);
export type ReadingLevel = z.infer<typeof ReadingLevel>;

export const READING_LEVEL_LABEL: Readonly<Record<ReadingLevel, string>> =
  Object.freeze({
    emerging: "Începe să citească",
    developing: "În formare",
    confident: "Sigur pe el",
    advanced: "Avansat",
  });

export const StoryCharacter = z.object({
  id: z.string(),
  name: z.string(),
  role: z.string().default(""),
  traits: z.string().default(""),
});
export type StoryCharacter = z.infer<typeof StoryCharacter>;

export const StoryScene = z.object({
  id: z.string(),
  type: SceneType,
  title: z.string(),
  narration: z.string().default(""),
  reflectionPrompt: z.string().default(""),
});
export type StoryScene = z.infer<typeof StoryScene>;

export const StoryBody = CommonBody.extend({
  readingLevel: ReadingLevel.default("developing"),
  setting: z.string().default(""),
  storyArc: z.string().default(""),
  vocabulary: z.array(z.string()).default([]),
  characters: z.array(StoryCharacter).default([]),
  scenes: z.array(StoryScene).default([]),
  activities: z.array(z.string()).default([]),
  reflection: z.string().default(""),
});
export type StoryBody = z.infer<typeof StoryBody>;

/* ------------------------------------------------------------------ game */

export const GameQuestion = z.object({
  id: z.string(),
  prompt: z.string(),
  choices: z.array(z.string()).default([]),
  correctIndex: z.number().int().nonnegative().default(0),
  points: z.number().int().nonnegative().default(10),
});
export type GameQuestion = z.infer<typeof GameQuestion>;

export const GameLevel = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string().default(""),
  difficulty: Difficulty.default("medium"),
});
export type GameLevel = z.infer<typeof GameLevel>;

export const GameMechanic = z.object({
  id: z.string(),
  label: z.string(),
  enabled: z.boolean().default(false),
  value: z.number().int().nonnegative().default(0),
});
export type GameMechanic = z.infer<typeof GameMechanic>;

export const MECHANICS_LIBRARY: readonly GameMechanic[] = [
  { id: "points", label: "Puncte", enabled: true, value: 10 },
  { id: "lives", label: "Vieți", enabled: true, value: 3 },
  { id: "timer", label: "Cronometru", enabled: false, value: 60 },
  { id: "teams", label: "Echipe", enabled: false, value: 2 },
  { id: "hints", label: "Indicii", enabled: true, value: 1 },
  { id: "badges", label: "Insigne", enabled: false, value: 0 },
];

export const GameBody = CommonBody.extend({
  estimatedMinutes: z.number().int().nonnegative().default(20),
  rules: z.string().default(""),
  mechanics: z.array(GameMechanic).default([]),
  levels: z.array(GameLevel).default([]),
  questions: z.array(GameQuestion).default([]),
  hints: z.array(z.string()).default([]),
});
export type GameBody = z.infer<typeof GameBody>;

/* ------------------------------------------------------------- worksheet */

/**
 * The sixth body.
 *
 * `worksheet` is the most-chosen entry in the create menu and was the only one
 * of the six with nowhere to land: the flow happily started a project for it,
 * and then nothing could open the thing it produced. A fișă is exercises with
 * instructions — deliberately not an assessment, which carries points, a
 * passing score and an answer key the pupil never sees.
 */
export const WorksheetExercise = z.object({
  id: z.string(),
  prompt: z.string(),
  /** Working space the pupil gets, in lines. Printed as ruled space. */
  lines: z.number().int().nonnegative().default(3),
  hint: z.string().default(""),
  answer: z.string().default(""),
});
export type WorksheetExercise = z.infer<typeof WorksheetExercise>;

export const WorksheetBody = CommonBody.extend({
  estimatedMinutes: z.number().int().nonnegative().default(20),
  instructions: z.string().default(""),
  materials: z.array(z.string()).default([]),
  exercises: z.array(WorksheetExercise).default([]),
  differentiation: z.string().default(""),
});
export type WorksheetBody = z.infer<typeof WorksheetBody>;

/* ---------------------------------------------------------- presentation */

export const SLIDE_TYPES = [
  "title",
  "objectives",
  "content",
  "activity",
  "summary",
  "homework",
] as const;
export const SlideType = z.enum(SLIDE_TYPES);
export type SlideType = z.infer<typeof SlideType>;

export const SLIDE_TYPE_LABEL: Readonly<Record<SlideType, string>> =
  Object.freeze({
    title: "Titlu",
    objectives: "Obiective",
    content: "Conținut",
    activity: "Activitate",
    summary: "Recapitulare",
    homework: "Temă",
  });

export const PresentationSlide = z.object({
  id: z.string(),
  type: SlideType,
  title: z.string(),
  body: z.string().default(""),
  bullets: z.array(z.string()).default([]),
  speakerNotes: z.string().default(""),
  estimatedSeconds: z.number().int().nonnegative().default(45),
});
export type PresentationSlide = z.infer<typeof PresentationSlide>;

export const PresentationBody = CommonBody.extend({
  slides: z.array(PresentationSlide).default([]),
});
export type PresentationBody = z.infer<typeof PresentationBody>;

/** Stable ids for freshly added child items. */
export const newItemId = (prefix: string): string =>
  `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
