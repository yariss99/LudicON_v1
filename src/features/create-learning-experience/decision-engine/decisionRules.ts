/**
 * AI-002 — Decision rules (ordered).
 * First matching rule wins. Add new rules without changing existing ones.
 */

import type { DecisionContext, DecisionRule, LearningCanvas } from "./decisionTypes";

function hasText(value?: string): boolean {
  return Boolean(value && value.trim().length > 0);
}

function hasItems(list: string[]): boolean {
  return list.length > 0;
}

function curriculumPresent(ctx: DecisionContext): boolean {
  return (
    ctx.pedagogicalState.curriculumLoaded || hasText(ctx.canvas.curriculum)
  );
}

function competenciesPresent(ctx: DecisionContext): boolean {
  return (
    ctx.pedagogicalState.competenciesLoaded ||
    hasItems(ctx.canvas.competencies)
  );
}

/** Mandatory sections for GENERATE_BLUEPRINT (Rules 1–7 chain). */
export function allMandatoryCanvasSectionsComplete(
  canvas: LearningCanvas,
  state: DecisionContext["pedagogicalState"],
): boolean {
  return (
    hasText(canvas.topic) &&
    hasText(canvas.grade) &&
    (state.curriculumLoaded || hasText(canvas.curriculum)) &&
    (state.competenciesLoaded || hasItems(canvas.competencies)) &&
    hasItems(canvas.objectives) &&
    hasItems(canvas.activities) &&
    hasItems(canvas.assessment) &&
    hasItems(canvas.resources)
  );
}

/**
 * Rules evaluated top → bottom.
 * Do not reorder casually — priority is part of the contract.
 */
export const DECISION_RULES: readonly DecisionRule[] = [
  {
    id: "R1_ASK_GRADE",
    matches: (ctx) =>
      hasText(ctx.canvas.topic) && !hasText(ctx.canvas.grade),
    action: "ASK_GRADE",
    reason: "Curriculum selection depends on grade.",
  },
  {
    id: "R2_LOAD_CURRICULUM",
    matches: (ctx) =>
      hasText(ctx.canvas.grade) && !curriculumPresent(ctx),
    action: "LOAD_CURRICULUM",
    reason: "Curriculum must be loaded before competencies can be selected.",
  },
  {
    id: "R3_LOAD_COMPETENCIES",
    matches: (ctx) =>
      curriculumPresent(ctx) && !competenciesPresent(ctx),
    action: "LOAD_COMPETENCIES",
    reason: "Competencies connect the curriculum to learning objectives.",
  },
  {
    id: "R4_ASK_OBJECTIVES",
    matches: (ctx) =>
      competenciesPresent(ctx) && !hasItems(ctx.canvas.objectives),
    action: "ASK_OBJECTIVES",
    reason: "Clear objectives guide activities and assessment.",
  },
  {
    id: "R5_ASK_ACTIVITIES",
    matches: (ctx) =>
      hasItems(ctx.canvas.objectives) && !hasItems(ctx.canvas.activities),
    action: "ASK_ACTIVITIES",
    reason: "Activities turn objectives into what students will do.",
  },
  {
    id: "R6_ASK_ASSESSMENT",
    matches: (ctx) =>
      hasItems(ctx.canvas.activities) && !hasItems(ctx.canvas.assessment),
    action: "ASK_ASSESSMENT",
    reason: "Assessment shows whether the intended learning landed.",
  },
  {
    id: "R7_ASK_RESOURCES",
    matches: (ctx) =>
      hasItems(ctx.canvas.assessment) && !hasItems(ctx.canvas.resources),
    action: "ASK_RESOURCES",
    reason: "Resources make the plan ready for the classroom.",
  },
  {
    id: "R8_GENERATE_BLUEPRINT",
    matches: (ctx) =>
      allMandatoryCanvasSectionsComplete(ctx.canvas, ctx.pedagogicalState),
    action: "GENERATE_BLUEPRINT",
    reason: "All mandatory Learning Canvas sections are complete.",
  },
] as const;
