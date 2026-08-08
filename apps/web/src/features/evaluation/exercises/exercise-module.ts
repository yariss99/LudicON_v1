import type { ComponentType } from "react";
import type { AnyExerciseDefinition, Theme } from "@ludicon/evaluation";

import type { RenderMode } from "../canvas/block-view";

/**
 * What one exercise type must export from its directory in this app.
 *
 * Three things and no more: the definition it renders (imported from
 * `@ludicon/evaluation`, never restated), the body that prints, and the fields
 * the teacher fills in. `registry.ts` finds every module matching this shape
 * with one glob, so a new type is a new directory here and nothing else — no
 * import added to a barrel, no case added to a switch, no name added to a map.
 *
 * ## Why the definition travels with the components
 *
 * `@ludicon/evaluation` deliberately has no `component` field: it is imported by
 * the API and by the PDF worker, and a React type on the definition would drag
 * a UI framework into both. The package therefore ships the data half and this
 * app ships the drawing half, joined by the `type` string.
 *
 * Re-exporting the definition here — rather than keeping a second list of
 * definitions somewhere — means the two halves are found by the SAME glob and
 * cannot fall out of step. A definition registered with no renderer prints as a
 * blank rectangle on a paper a class is about to sit; making that structurally
 * impossible is better than the boot-time check that would otherwise catch it.
 *
 * ## Config and answer arrive as `unknown`
 *
 * Both are opaque in the document model, and narrowing them is the type's own
 * job because only the type owns the schema. Each module parses with its own
 * `safeParse` and draws a hint rather than throwing when the parse fails — a
 * paper that half-renders is recoverable, a canvas that crashes is not.
 */

export interface ExerciseBodyProps {
  /** The block's `config`, unparsed. Parse it with this type's own schema. */
  readonly config: unknown;
  readonly theme: Theme;
  /** Resolved from the definition's `layouts`; never `null` here. */
  readonly layoutId: string;
  /**
   * `edit` may show hints for parts the teacher has not filled in yet;
   * `preview` must draw exactly what the printer will produce.
   */
  readonly mode: RenderMode;
}

/**
 * The pair a change produces, always written together.
 *
 * One callback, not two, because removing an option and shifting the barem's
 * index down are one thought and must be one press of ⌘Z. Two callbacks would
 * make them two history steps, and undoing halfway would leave a barem pointing
 * at an option that is no longer there.
 */
export interface ExerciseDraft {
  readonly config: unknown;
  /** `null` clears the barem row — the state a fresh exercise starts in. */
  readonly answer: unknown;
}

export interface ExerciseFieldsProps {
  readonly config: unknown;
  /** `undefined` until the teacher has said what the right answer is. */
  readonly answer: unknown;
  /** Prefix for input ids, so two exercises on a page do not share labels. */
  readonly idPrefix: string;
  readonly onChange: (draft: ExerciseDraft) => void;
}

export interface ExerciseModule {
  readonly definition: AnyExerciseDefinition;
  readonly Body: ComponentType<ExerciseBodyProps>;
  readonly Fields: ComponentType<ExerciseFieldsProps>;
}
