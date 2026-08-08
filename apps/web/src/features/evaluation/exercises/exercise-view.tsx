import type { CSSProperties } from "react";
import {
  isEmptyInline,
  paintBlockStyle,
  resolveBlockStyle,
  resolveColor,
  resolveExerciseLayout,
  type ExerciseBlock,
  type Theme,
} from "@ludicon/evaluation";

import type { RenderMode } from "../canvas/block-view";
import { InlineView } from "../canvas/inline-view";
import { mm, pt } from "../canvas/mm";
import { EVALUATION_COPY } from "../copy";
import { PaperHint } from "./paper";
import { EXERCISE_BODIES, EXERCISE_REGISTRY } from "./registry";

/**
 * One exercise on the paper: its number, its cerință, its points, its body.
 *
 * ## The number is COUNTED, not stored
 *
 * An exercise block holds no number and never will. A number is a fact about
 * where the exercise sits, and papers are edited in the middle: inserting a
 * question at the top renumbers everything below it, and a stored number would
 * mean rewriting every block after every insert — with an undo step for each,
 * and a barem keyed by number silently pairing answers with the wrong
 * questions. `model/answer-key.ts` argues the same thing from the other end.
 *
 * So the number comes from a CSS counter reset on `[data-document-id]` and
 * incremented by each exercise in DOM order. That is document order by
 * construction, it costs nothing to reorder, and it is the one derivation this
 * component can make without being handed the document — which matters, because
 * `BlockView` is given a block, a theme and a mode, and giving it the whole
 * paper to count exercises would make every block re-render whenever any block
 * changed.
 *
 * The rejected alternative was passing an index down from the section renderer.
 * It is cleaner to read and it needs a prop on a component two packages of
 * rendering are built around; the counter needs nothing. (If that prop ever
 * arrives, this is the file that should stop using the counter.)
 *
 * The stylesheet carries `href` and `precedence`, so React 19 hoists it once
 * into the head no matter how many exercises declare it. It contains four
 * static rules about generated content and no editor state — the pure-renderer
 * contract is about what reaches the printed tree, and a counter is exactly as
 * printable as the text beside it.
 *
 * ## An unknown type prints nothing and says so on screen
 *
 * A paper can outlive a registry entry. In `edit` the teacher gets a sentence
 * naming what happened; in `preview` — which must be the truth about the
 * printer — it draws nothing, because printing "this exercise no longer exists"
 * onto a pupil's paper would be worse than the gap. `validateProject` already
 * refuses to let such a paper print at all.
 */

const NUMBER_COUNTER = "ludicon-exercise";

const NUMBERING_CSS = `
[data-document-id]{counter-reset:${NUMBER_COUNTER} 0}
[data-exercise-number]{counter-increment:${NUMBER_COUNTER}}
[data-exercise-number="arabic"]::before{content:counter(${NUMBER_COUNTER}) ". "}
[data-exercise-number="roman"]::before{content:counter(${NUMBER_COUNTER},upper-roman) ". "}
[data-exercise-number="letters"]::before{content:counter(${NUMBER_COUNTER},upper-latin) ") "}
`;

export interface ExerciseViewProps {
  block: ExerciseBlock;
  theme: Theme;
  mode: RenderMode;
}

export function ExerciseView({ block, theme, mode }: ExerciseViewProps) {
  const style = paintBlockStyle(theme, resolveBlockStyle(theme, block));
  const editing = mode === "edit";
  const definition = EXERCISE_REGISTRY.get(block.exerciseType);
  const Body = EXERCISE_BODIES.get(block.exerciseType);
  const layout = definition
    ? resolveExerciseLayout(definition, block.layoutId)
    : undefined;
  const defaults = theme.exerciseDefaults;

  const frame: CSSProperties = {
    color: style.color,
    backgroundColor: style.background ?? undefined,
    fontSize: pt(style.fontSizePt),
    fontWeight: style.fontWeight,
    lineHeight: style.lineHeight,
    letterSpacing: `${style.letterSpacingEm}em`,
    marginTop: mm(style.marginTopMm),
    marginBottom: mm(style.marginBottomMm),
    ...(layout?.id === "card"
      ? {
          borderStyle: "solid",
          borderWidth: mm(theme.borders.hairlineMm),
          borderColor: resolveColor(theme, "border"),
          borderRadius: mm(theme.radius.mediumMm),
          padding: mm(4),
        }
      : {}),
  };

  if (!definition || !Body || !layout) {
    return (
      <div data-block-id={block.id} style={frame}>
        {editing ? (
          <PaperHint theme={theme}>{EVALUATION_COPY.exerciseGone}</PaperHint>
        ) : null}
      </div>
    );
  }

  return (
    <div data-block-id={block.id} style={frame}>
      <style href="ludicon-exercise-numbering" precedence="high">
        {NUMBERING_CSS}
      </style>

      {/**
       * The heading line: number, cerință, points.
       *
       * `baseline` alignment, so the points sit on the same line as the last
       * line of a cerință that wrapped — which is where a teacher writing on
       * paper puts them.
       */}
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          columnGap: mm(1.6),
        }}
      >
        {defaults.numbering === "none" ? null : (
          <span
            data-exercise-number={defaults.numbering}
            style={{ flex: "none", fontWeight: 600 }}
          />
        )}

        <span style={{ flex: "1 1 auto", minWidth: 0 }}>
          {isEmptyInline(block.prompt) ? (
            editing ? (
              <PaperHint theme={theme}>
                {EVALUATION_COPY.exercisePromptHint}
              </PaperHint>
            ) : null
          ) : (
            <InlineView nodes={block.prompt} />
          )}
        </span>

        {/**
         * Nothing is printed for an exercise worth nothing.
         *
         * `showPoints` is the theme saying "this paper carries its marks"; a
         * question the teacher deliberately set to zero — a worked example, a
         * warm-up — is not one of them, and "0 p." beside it invites a pupil to
         * spend time on something that cannot earn any.
         */}
        {defaults.showPoints && block.points > 0 ? (
          <span
            style={{
              flex: "none",
              fontSize: "0.85em",
              color: resolveColor(theme, "textMuted"),
              whiteSpace: "nowrap",
            }}
          >
            {EVALUATION_COPY.exercisePoints(block.points, defaults.pointsLabel)}
          </span>
        ) : null}
      </div>

      <div style={{ marginTop: mm(2) }}>
        <Body
          config={block.config}
          theme={theme}
          layoutId={layout.id}
          mode={mode}
        />
      </div>
    </div>
  );
}
