import { ASSET_KIND_LABEL, type AssetKind } from "@ludicon/domain";

import { BUILDER_KINDS, type BuilderKind } from "../builder/types";

/**
 * What the teacher may ask for here.
 *
 * Exactly the kinds that have an authoring surface, minus `lesson_plan`: the
 * lesson design already exists — it is the thing everything on this page is
 * made *from* — and offering to produce a copy of it would blur the one
 * relationship the product depends on.
 *
 * Offering anything else would put a material in the teacher's hands that
 * nothing can open. That was the dead end at the end of the chain, and the fix
 * is not a friendlier message on the empty screen; it is not offering it.
 */
export const OFFERED_KINDS: readonly BuilderKind[] = BUILDER_KINDS.filter(
  (kind) => kind !== "lesson_plan",
);

/** One short line per material, so the choice is pedagogical and not a guess. */
export const KIND_HINT: Readonly<Record<AssetKind, string>> = Object.freeze({
  lesson_plan: "Lecția, așa cum ai proiectat-o.",
  worksheet: "Exerciții pentru lucrul individual sau în perechi.",
  assessment: "Un moment de verificare a înțelegerii.",
  story: "Un text narativ care poartă ideea lecției.",
  game: "O activitate cu reguli, pentru învățare prin joc.",
  presentation: "Suport vizual pentru momentele frontale.",
  rubric: "Criteriile după care privești lucrările.",
  homework: "Ce continuă acasă ce s-a început la clasă.",
  observation_sheet: "Un loc unde notezi ce vezi în timpul lecției.",
  note: "O însemnare care rămâne la tine.",
});

/** The material's name as the teacher meets it everywhere else. */
export const kindLabel = (kind: AssetKind): string => ASSET_KIND_LABEL[kind];
