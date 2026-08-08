import { z } from "zod";
import { Timestamp } from "./identifiers.js";

/**
 * ONE actor union.
 *
 * Replaces eight byte-identical declarations found in the pre-refactor tree
 * (ArtifactActor, LessonActor, PresentationActor, AssessmentActor,
 * ResourceActor, GameActor, AssistantActor, StoryActor).
 */
export const Actor = z.enum(["teacher", "ai", "system"]);
export type Actor = z.infer<typeof Actor>;

/**
 * ONE lifecycle status.
 *
 * Replaces 25 distinct `*Status` unions. Values follow the POM lifecycle named
 * in the Constitutional Domain Model.
 */
export const LifecycleStatus = z.enum([
  "draft",
  "needs_review",
  "ready",
  "published",
  "archived",
  "superseded",
]);
export type LifecycleStatus = z.infer<typeof LifecycleStatus>;

/**
 * ONE severity vocabulary.
 *
 * The old tree had two incompatible ones — `error|warning|info` and
 * `blocking|warning|info` — under the same type name in different files.
 * `blocking` is the meaningful distinction (it gates the approval gate), so it
 * survives as its own level rather than being collapsed into `error`.
 */
export const IssueSeverity = z.enum(["blocking", "error", "warning", "info"]);
export type IssueSeverity = z.infer<typeof IssueSeverity>;

/** ONE validation issue. Replaces nine parallel `*ValidationIssue` families. */
export const ValidationIssue = z.object({
  code: z.string().min(1),
  severity: IssueSeverity,
  /** Teacher-facing Romanian message. Must satisfy UX-001: no architecture jargon. */
  message: z.string().min(1),
  /** Optional pointer to the offending field/section, for inline display. */
  path: z.string().optional(),
  /** What the teacher can do about it. Never blame, always actionable. */
  remedy: z.string().optional(),
});
export type ValidationIssue = z.infer<typeof ValidationIssue>;

/** ONE validation report. Replaces nine parallel `*ValidationReport` families. */
export const ValidationReport = z.object({
  issues: z.array(ValidationIssue),
  checkedAt: Timestamp,
});
export type ValidationReport = z.infer<typeof ValidationReport>;

export const hasBlockingIssues = (report: ValidationReport): boolean =>
  report.issues.some((issue) => issue.severity === "blocking");

/**
 * ONE asset taxonomy.
 *
 * Reconciles six overlapping vocabularies that disagreed across feature
 * boundaries — notably `game` vs `educational_game` and `lesson` vs
 * `lesson_plan`, which silently failed to match when data crossed features.
 */
export const AssetKind = z.enum([
  "lesson_plan",
  "worksheet",
  "assessment",
  "story",
  "game",
  "presentation",
  "rubric",
  "homework",
  "observation_sheet",
  "note",
]);
export type AssetKind = z.infer<typeof AssetKind>;

/** Romanian teacher-facing label per asset kind (UX-001: no jargon). */
export const ASSET_KIND_LABEL: Readonly<Record<AssetKind, string>> =
  Object.freeze({
    lesson_plan: "Designul lecției",
    worksheet: "Fișă de lucru",
    assessment: "Evaluare",
    story: "Poveste",
    game: "Joc educațional",
    presentation: "Prezentare",
    rubric: "Criterii de evaluare",
    homework: "Temă",
    observation_sheet: "Fișă de observare",
    note: "Notiță",
  });

export const GradeLevel = z.enum([
  "pregatitoare",
  "clasa_1",
  "clasa_2",
  "clasa_3",
  "clasa_4",
  "clasa_5",
  "clasa_6",
  "clasa_7",
  "clasa_8",
]);
export type GradeLevel = z.infer<typeof GradeLevel>;

export const GRADE_LEVEL_LABEL: Readonly<Record<GradeLevel, string>> =
  Object.freeze({
    pregatitoare: "Clasa pregătitoare",
    clasa_1: "Clasa I",
    clasa_2: "Clasa a II-a",
    clasa_3: "Clasa a III-a",
    clasa_4: "Clasa a IV-a",
    clasa_5: "Clasa a V-a",
    clasa_6: "Clasa a VI-a",
    clasa_7: "Clasa a VII-a",
    clasa_8: "Clasa a VIII-a",
  });

/**
 * ONE discipline vocabulary.
 *
 * The seven named values are exactly the subjects the create flow's intent
 * parser already recognises from the teacher's first sentence. They were free
 * text on both sides of that guess — the parser emitted "Științe ale naturii"
 * and the plan stored whatever the teacher typed — so a guess and a stored
 * subject were two strings that happened to look alike, and any grouping by
 * subject was a string comparison waiting to fail on a diacritic.
 *
 * `alta` is the eighth on purpose. The parser proposes a starting point the
 * teacher corrects on the next step, so a teacher whose subject is not on the
 * list has to be able to say that rather than be filed under the nearest wrong
 * one.
 *
 * Ids are code, so they stay ASCII snake_case and carry no diacritics: they
 * travel through URLs, filenames, query strings and JSON, where "științe"
 * survives none of the four reliably. Every diacritic lives in the frozen label
 * map below, which is the only teacher-facing spelling.
 */
export const Discipline = z.enum([
  "matematica",
  "stiinte",
  "limba_romana",
  "limba_engleza",
  "istorie",
  "geografie",
  "arte_vizuale",
  "alta",
]);
export type Discipline = z.infer<typeof Discipline>;

/** Romanian teacher-facing label per discipline (UX-001: no jargon). */
export const DISCIPLINE_LABEL: Readonly<Record<Discipline, string>> =
  Object.freeze({
    matematica: "Matematică",
    stiinte: "Științe ale naturii",
    limba_romana: "Limba și literatura română",
    limba_engleza: "Limba engleză",
    istorie: "Istorie",
    geografie: "Geografie",
    arte_vizuale: "Arte vizuale",
    alta: "Altă disciplină",
  });
