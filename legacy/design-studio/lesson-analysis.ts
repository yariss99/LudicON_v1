import {
  APPROVAL_REQUIRED_SECTIONS,
  BlockId,
  blocksForSection,
  LESSON_SECTION_ORDER,
  totalPlannedMinutes,
  type CompletionState,
  type DesignScore,
  type LessonPlan,
  type LessonSectionId,
  type PedagogicalBlock,
} from "@ludicon/domain";

/**
 * Reading the lesson, without touching it.
 *
 * Every function here is pure and derives its answer from `plan.blocks`. That
 * is deliberate: completion and balance are *consequences* of what the teacher
 * wrote, so storing them as independent fields guarantees they eventually
 * disagree with the lesson they describe. They are persisted on save only so
 * other surfaces can read them without re-deriving.
 */

/** A block is finished when it says what it is and why it exists. */
const isBlockComplete = (block: PedagogicalBlock): boolean =>
  block.title.trim().length > 0 && block.purpose.trim().length > 0;

export function sectionCompletion(
  plan: LessonPlan,
  section: LessonSectionId,
): CompletionState {
  const blocks = blocksForSection(plan, section);
  if (blocks.length === 0) return "empty";
  return blocks.every(isBlockComplete) ? "complete" : "partial";
}

export function completionMap(
  plan: LessonPlan,
): Partial<Record<LessonSectionId, CompletionState>> {
  return Object.fromEntries(
    LESSON_SECTION_ORDER.map((section) => [
      section,
      sectionCompletion(plan, section),
    ]),
  );
}

/** Romanian wording for a section's state. Words, never colour alone. */
export const COMPLETION_LABEL: Readonly<Record<CompletionState, string>> =
  Object.freeze({
    empty: "Neînceput",
    partial: "În lucru",
    complete: "Completat",
  });

/**
 * Sections still expected before the design can become materials.
 *
 * Phrased as "what is left", never as a failure — `APPROVAL_REQUIRED_SECTIONS`
 * is the domain's own list, so the studio and the gate can never disagree.
 */
export function sectionsStillNeeded(plan: LessonPlan): LessonSectionId[] {
  return APPROVAL_REQUIRED_SECTIONS.filter(
    (section) => sectionCompletion(plan, section) !== "complete",
  );
}

export const isReadyForMaterials = (plan: LessonPlan): boolean =>
  sectionsStillNeeded(plan).length === 0;

const share = (count: number, total: number): number =>
  total <= 0 ? 0 : Math.round((count / total) * 100);

const capped = (count: number, target: number): number =>
  Math.min(100, share(count, target));

/**
 * The lesson's balance across six dimensions.
 *
 * The design book fixes the *dimensions* and how they must be presented, but
 * not the arithmetic — these formulas are a first, deliberately legible pass
 * over what the teacher has actually written. They are meant to be replaced by
 * the pedagogical scoring engine, and nothing in the UI depends on the exact
 * numbers: the meter renders any 0–100 and explains anything low in words.
 */
export function designScore(plan: LessonPlan): DesignScore {
  const total = plan.blocks.length;

  const curriculum = share(
    plan.blocks.filter((block) => block.competencies.length > 0).length,
    total,
  );
  const activities = capped(blocksForSection(plan, "activities").length, 3);
  const assessmentState = sectionCompletion(plan, "assessment");
  const assessment =
    assessmentState === "complete"
      ? 100
      : assessmentState === "partial"
        ? 55
        : 0;
  const differentiation = share(
    plan.blocks.filter((block) => block.strategy.trim().length > 0).length,
    total,
  );

  const planned = totalPlannedMinutes(plan);
  const target = plan.durationMinutes;
  const timeBalance =
    target <= 0 || planned === 0
      ? 0
      : Math.max(
          0,
          100 - Math.round((Math.abs(planned - target) / target) * 100),
        );

  const accessibility = share(
    plan.blocks.filter((block) => block.resources.length > 0).length,
    total,
  );

  const dimensions = [
    curriculum,
    activities,
    assessment,
    differentiation,
    timeBalance,
    accessibility,
  ];

  return {
    overall: Math.round(
      dimensions.reduce((sum, value) => sum + value, 0) / dimensions.length,
    ),
    curriculum,
    activities,
    assessment,
    differentiation,
    timeBalance,
    accessibility,
  };
}

/** A fresh block, ordered after everything already in its section. */
export function makeBlock(
  plan: LessonPlan,
  section: LessonSectionId,
  title: string,
  extra?: Partial<
    Pick<PedagogicalBlock, "purpose" | "estimatedMinutes" | "strategy">
  >,
): PedagogicalBlock {
  const existing = blocksForSection(plan, section);
  const lastOrder = existing.at(-1)?.order ?? -1;

  return {
    id: BlockId.parse(crypto.randomUUID()),
    section,
    title,
    purpose: extra?.purpose ?? "",
    estimatedMinutes: extra?.estimatedMinutes ?? null,
    objectives: [],
    competencies: [],
    strategy: extra?.strategy ?? "",
    resources: [],
    notes: "",
    status: "draft",
    order: lastOrder + 1,
  };
}

/** Replaces one block, leaving the rest of the plan untouched. */
export const withBlock = (
  plan: LessonPlan,
  next: PedagogicalBlock,
): LessonPlan => ({
  ...plan,
  blocks: plan.blocks.map((block) => (block.id === next.id ? next : block)),
});

export const withBlocks = (
  plan: LessonPlan,
  blocks: readonly PedagogicalBlock[],
): LessonPlan => ({ ...plan, blocks: [...blocks] });

/**
 * Moves a block one place within its own section.
 *
 * Order is rewritten for the whole section afterwards, so a plan that arrives
 * with duplicate or gapped `order` values comes out consistent.
 */
export function moveBlock(
  plan: LessonPlan,
  blockId: PedagogicalBlock["id"],
  direction: -1 | 1,
): LessonPlan {
  const target = plan.blocks.find((block) => block.id === blockId);
  if (!target) return plan;

  const siblings = blocksForSection(plan, target.section);
  const index = siblings.findIndex((block) => block.id === blockId);
  const swapWith = index + direction;
  if (swapWith < 0 || swapWith >= siblings.length) return plan;

  const reordered = siblings.map((block, position) => {
    if (position === index) return siblings[swapWith] ?? block;
    if (position === swapWith) return siblings[index] ?? block;
    return block;
  });

  const renumbered = new Map(
    reordered.map((block, position) => [block.id, position]),
  );

  return withBlocks(
    plan,
    plan.blocks.map((block) => {
      const order = renumbered.get(block.id);
      return order === undefined ? block : { ...block, order };
    }),
  );
}
