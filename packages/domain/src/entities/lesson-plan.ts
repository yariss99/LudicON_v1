import { z } from "zod";
import {
  BlockId,
  LessonPlanId,
  ProjectId,
  TeacherId,
  Timestamp,
} from "../primitives/identifiers.js";
import { LifecycleStatus, ValidationReport } from "../primitives/shared.js";

/**
 * The nine canonical sections of the lesson design, in the order the Design
 * Book fixes for the navigator. Internal ids stay English (code-side);
 * teacher-facing Romanian labels live in `LESSON_SECTION_LABEL`.
 */
export const LessonSectionId = z.enum([
  "general",
  "competencies",
  "objectives",
  "sequence",
  "activities",
  "resources",
  "assessment",
  "reflection",
  "publication",
]);
export type LessonSectionId = z.infer<typeof LessonSectionId>;

export const LESSON_SECTION_ORDER: readonly LessonSectionId[] = Object.freeze([
  "general",
  "competencies",
  "objectives",
  "sequence",
  "activities",
  "resources",
  "assessment",
  "reflection",
  "publication",
]);

export const LESSON_SECTION_LABEL: Readonly<Record<LessonSectionId, string>> =
  Object.freeze({
    general: "Informații generale",
    competencies: "Competențe",
    objectives: "Obiective de învățare",
    sequence: "Secvența de învățare",
    activities: "Activități",
    resources: "Resurse",
    assessment: "Evaluare",
    reflection: "Reflecție",
    publication: "Publicare",
  });

/** Sections that must be complete before the approval gate can open. */
export const APPROVAL_REQUIRED_SECTIONS: readonly LessonSectionId[] =
  Object.freeze([
    "general",
    "objectives",
    "sequence",
    "assessment",
    "resources",
  ]);

export const CompletionState = z.enum(["empty", "partial", "complete"]);
export type CompletionState = z.infer<typeof CompletionState>;

/**
 * A pedagogical block on the design canvas.
 * Field set follows the Design Book's block anatomy.
 */
export const PedagogicalBlock = z.object({
  id: BlockId,
  section: LessonSectionId,
  title: z.string().min(1).max(200),
  /** Why this block exists pedagogically. Required by the card model, max ~140 chars. */
  purpose: z.string().max(140).default(""),
  estimatedMinutes: z.number().int().min(0).max(600).nullable().default(null),
  objectives: z.array(z.string().max(300)).default([]),
  competencies: z.array(z.string().max(300)).default([]),
  strategy: z.string().max(2000).default(""),
  resources: z.array(z.string().max(300)).default([]),
  /** Teacher-private notes. Never surfaced to learners or exports by default. */
  notes: z.string().max(4000).default(""),
  status: LifecycleStatus.default("draft"),
  order: z.number().int().nonnegative(),
});
export type PedagogicalBlock = z.infer<typeof PedagogicalBlock>;

/**
 * The design score. Explicitly a support metric, never a grade — the UI must
 * present it as guidance and must never render a low dimension as traffic-light
 * red. Modelled as 0..100 per dimension.
 */
export const DesignScore = z.object({
  overall: z.number().min(0).max(100),
  curriculum: z.number().min(0).max(100),
  activities: z.number().min(0).max(100),
  assessment: z.number().min(0).max(100),
  differentiation: z.number().min(0).max(100),
  timeBalance: z.number().min(0).max(100),
  accessibility: z.number().min(0).max(100),
});
export type DesignScore = z.infer<typeof DesignScore>;

export const DESIGN_SCORE_LABEL: Readonly<Record<keyof DesignScore, string>> =
  Object.freeze({
    overall: "Scor design",
    curriculum: "Curriculum",
    activities: "Activități",
    assessment: "Evaluare",
    differentiation: "Diferențiere",
    timeBalance: "Timp",
    accessibility: "Accesibilitate",
  });

/**
 * The lesson design — the durable educational object and single source of
 * educational truth. Everything downstream is generated from an approved one.
 */
export const LessonPlan = z.object({
  id: LessonPlanId,
  projectId: ProjectId,
  title: z.string().min(1).max(300),
  subject: z.string().min(1).max(120),
  grade: z.string().min(1).max(60),
  durationMinutes: z.number().int().min(0).max(600).default(45),
  blocks: z.array(PedagogicalBlock).default([]),
  // Zod 4 made enum-keyed `z.record` exhaustive — every section would be
  // required. Completion is genuinely sparse (a new plan has none), so this
  // needs the partial variant.
  completion: z.partialRecord(LessonSectionId, CompletionState).default({}),
  score: DesignScore.nullable().default(null),
  validation: ValidationReport.nullable().default(null),
  status: LifecycleStatus.default("draft"),
  version: z.number().int().nonnegative().default(0),
  /** Set once the teacher passes the binding approval gate. */
  approvedAt: Timestamp.nullable().default(null),
  /** Who opened the gate. Approval is an act, so it has an author. */
  approvedBy: TeacherId.nullable().default(null),
  /** What the teacher said while confirming, kept with the approval. */
  approvalNote: z.string().max(500).nullable().default(null),
  createdAt: Timestamp,
  updatedAt: Timestamp,
});
export type LessonPlan = z.infer<typeof LessonPlan>;

/**
 * The three approval fields are absent on purpose.
 *
 * The gate is a transition — `approveLessonPlan` below — never a field write.
 * A design that could be approved by a stray patch would not be a gate.
 */
export const LessonPlanPatch = LessonPlan.omit({
  id: true,
  projectId: true,
  approvedAt: true,
  approvedBy: true,
  approvalNote: true,
  createdAt: true,
}).partial();
export type LessonPlanPatch = z.infer<typeof LessonPlanPatch>;

export const isApproved = (plan: LessonPlan): boolean =>
  plan.approvedAt !== null;

export type Approval = {
  at: Timestamp;
  by: TeacherId;
  /** The teacher's own words, if they left any. */
  note?: string;
};

/**
 * Opens the binding gate.
 *
 * There is no matching `revokeApproval`, and that is the point: approval is the
 * teacher saying this design is theirs. The design stays editable afterwards —
 * Teacher Authority means the teacher keeps hold of the work, not that the work
 * freezes — but the fact that they once said yes is not something the product
 * takes back on their behalf.
 */
export const approveLessonPlan = (
  plan: LessonPlan,
  approval: Approval,
): LessonPlan => ({
  ...plan,
  approvedAt: approval.at,
  approvedBy: approval.by,
  approvalNote: approval.note ?? null,
  status: "ready",
  updatedAt: approval.at,
});

/** Blocks for one section, in canvas order. */
export const blocksForSection = (
  plan: LessonPlan,
  section: LessonSectionId,
): PedagogicalBlock[] =>
  plan.blocks
    .filter((block) => block.section === section)
    .sort((a, b) => a.order - b.order);

export const totalPlannedMinutes = (plan: LessonPlan): number =>
  plan.blocks.reduce((sum, block) => sum + (block.estimatedMinutes ?? 0), 0);
