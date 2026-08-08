/**
 * Database enum value tuples, pinned to the domain unions.
 *
 * These exist as literal tuples because `pgEnum` needs a non-empty readonly
 * tuple, which a Zod enum's `.options` cannot provide without a cast. Writing
 * them out is the cost; the two guards below are what make it safe:
 *
 *   - `satisfies readonly X[]` rejects a value that is not in the domain union.
 *   - `SCHEMA_ENUMS_MATCH_DOMAIN` rejects a domain value that is missing here.
 *
 * Together they turn "someone added an AssetKind and forgot the migration"
 * from a production constraint violation into a failed `npm run typecheck`.
 */
import type {
  Actor,
  AssetKind,
  CompletionState,
  Discipline,
  GradeLevel,
  LessonSectionId,
  LifecycleStatus,
  ProjectColor,
  ProjectState,
} from "@ludicon/domain";

export const ACTOR_VALUES = [
  "teacher",
  "ai",
  "system",
] as const satisfies readonly Actor[];

export const LIFECYCLE_STATUS_VALUES = [
  "draft",
  "needs_review",
  "ready",
  "published",
  "archived",
  "superseded",
] as const satisfies readonly LifecycleStatus[];

export const ASSET_KIND_VALUES = [
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
] as const satisfies readonly AssetKind[];

export const GRADE_LEVEL_VALUES = [
  "pregatitoare",
  "clasa_1",
  "clasa_2",
  "clasa_3",
  "clasa_4",
  "clasa_5",
  "clasa_6",
  "clasa_7",
  "clasa_8",
] as const satisfies readonly GradeLevel[];

/**
 * The subject an evaluation paper is written for.
 *
 * A `pgEnum` rather than the `text` column `projects.subject` still uses. The
 * two are not the same fact: `subject` predates `Discipline` and holds whatever
 * a teacher typed, so it cannot be constrained without first reconciling the
 * rows behind it. `evaluation_projects.discipline` is a projection of
 * `EvaluationMeta.discipline`, which is the closed union from day one — leaving
 * it free text would mean the database accepted "Matematica", "matematică" and
 * "matematica" as three disciplines while the application knows only one.
 */
export const DISCIPLINE_VALUES = [
  "matematica",
  "stiinte",
  "limba_romana",
  "limba_engleza",
  "istorie",
  "geografie",
  "arte_vizuale",
  "alta",
] as const satisfies readonly Discipline[];

export const PROJECT_STATE_VALUES = [
  "discovery",
  "design",
  "approved",
  "materials_ready",
  "published",
] as const satisfies readonly ProjectState[];

export const PROJECT_COLOR_VALUES = [
  "blue",
  "emerald",
  "amber",
  "slate",
  "rose",
  "teal",
] as const satisfies readonly ProjectColor[];

export const LESSON_SECTION_VALUES = [
  "general",
  "competencies",
  "objectives",
  "sequence",
  "activities",
  "resources",
  "assessment",
  "reflection",
  "publication",
] as const satisfies readonly LessonSectionId[];

export const COMPLETION_STATE_VALUES = [
  "empty",
  "partial",
  "complete",
] as const satisfies readonly CompletionState[];

/** `true` when every member of `TUnion` appears in `TValues`, otherwise `never`. */
type Covers<TUnion extends string, TValues extends readonly string[]> = [
  Exclude<TUnion, TValues[number]>,
] extends [never]
  ? true
  : never;

/**
 * The completeness half of the drift guard.
 *
 * If a domain union gains a value that is not mirrored above, the matching
 * `Covers<…>` collapses to `never`, the intersection collapses to `never`, and
 * assigning `true` to it fails to compile with the offending union named in the
 * error.
 */
export const SCHEMA_ENUMS_MATCH_DOMAIN: Covers<Actor, typeof ACTOR_VALUES> &
  Covers<LifecycleStatus, typeof LIFECYCLE_STATUS_VALUES> &
  Covers<AssetKind, typeof ASSET_KIND_VALUES> &
  Covers<Discipline, typeof DISCIPLINE_VALUES> &
  Covers<GradeLevel, typeof GRADE_LEVEL_VALUES> &
  Covers<ProjectState, typeof PROJECT_STATE_VALUES> &
  Covers<ProjectColor, typeof PROJECT_COLOR_VALUES> &
  Covers<LessonSectionId, typeof LESSON_SECTION_VALUES> &
  Covers<CompletionState, typeof COMPLETION_STATE_VALUES> = true;
