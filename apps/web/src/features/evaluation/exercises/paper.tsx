import { Fragment, type CSSProperties, type ReactNode } from "react";
import {
  optionMarker,
  positionMarker,
  resolveColor,
  type Theme,
} from "@ludicon/evaluation";

import { mm } from "../canvas/mm";

/**
 * The marks a Romanian evaluation paper is made of, drawn once.
 *
 * Fourteen exercise types share about eight shapes — a ruled line to write on,
 * a box to tick, a blank in a sentence, a column of options, a framed area for
 * working out. Drawn privately by each type they would drift within a page: one
 * type's writing lines 8mm apart and another's 9, one blank underlined and the
 * next dotted, on the same sheet. A pupil reads that as two different papers.
 *
 * ## Every colour here comes from the teacher's theme, as an inline hex
 *
 * This is the one place in the product where a literal colour is correct, and
 * the reason is in `canvas/block-view.tsx`: these marks are printed. The design
 * system's semantic tokens follow the reader's light/dark preference, and paper
 * has neither — a rule painted `--border` would be invisible in a dark-mode
 * screenshot and wrong in the printer. So the rule's colour is
 * `theme.exerciseDefaults.answerRuleColor`, resolved through the model, which
 * is the teacher's own choice stored as data.
 *
 * ## Nothing here knows what is selected
 *
 * No hover, no focus, no `data-*` beyond what the model justifies. These
 * components sit under `DocumentRenderer`, which has to produce the printed
 * sheet and the PDF as well as the screen; the moment one of them drew a
 * selection outline the preview would stop being a preview. Everything the
 * teacher can touch is layered over the page by the editor's overlay.
 *
 * Sizes are in millimetres through `mm()`, never pixels, so a zoom change is
 * one custom-property write and the marks stay in step with the type.
 */

/** The rule a pupil writes on, straight from the theme. */
const ruleStyle = (theme: Theme): CSSProperties => ({
  borderBottomStyle: "solid",
  borderBottomWidth: mm(theme.exerciseDefaults.answerRuleWidthMm),
  borderBottomColor: resolveColor(
    theme,
    theme.exerciseDefaults.answerRuleColor,
  ),
});

/**
 * The air between the cerință and the first rule under it.
 *
 * Exported because a type that wants to print something ON the first line — a
 * unit after a short answer, a label before a working area — has to start at
 * the same height, and a second copy of the number is a second thing to change.
 */
export const FIRST_RULE_TOP_MM = 1.5;

/**
 * Ruled lines to write on.
 *
 * The gap comes from the theme rather than from a constant here because
 * Romanian primary ruled paper is 8-9mm and a pupil in clasa a II-a cannot fit
 * their letters into less — that is a decision about the class the paper is
 * for, which is what a theme is.
 */
export function WritingLines({
  theme,
  count,
  gapMm,
}: {
  theme: Theme;
  count: number;
  gapMm?: number;
}) {
  const gap = gapMm ?? theme.exerciseDefaults.answerLineGapMm;
  return (
    <div style={{ marginTop: mm(FIRST_RULE_TOP_MM) }}>
      {Array.from({ length: Math.max(0, count) }, (_, index) => (
        <div key={index} style={{ height: mm(gap), ...ruleStyle(theme) }} />
      ))}
    </div>
  );
}

/**
 * A blank inside a sentence.
 *
 * `inline-block` with a fixed width rather than a run of underscores: a row of
 * "____" breaks differently in every font and cannot be made a reliable length,
 * and it reads to a screen reader as a word. This is a box with a rule under
 * it, so it measures the same on screen and in the PDF.
 */
export function Blank({
  theme,
  widthMm = 22,
}: {
  theme: Theme;
  widthMm?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        width: mm(widthMm),
        ...ruleStyle(theme),
      }}
    />
  );
}

/** The empty square a pupil ticks. */
export function TickBox({
  theme,
  sizeMm = 4.2,
}: {
  theme: Theme;
  sizeMm?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        flex: "none",
        width: mm(sizeMm),
        height: mm(sizeMm),
        marginTop: mm(0.6),
        borderStyle: "solid",
        borderWidth: mm(theme.exerciseDefaults.answerRuleWidthMm),
        borderColor: resolveColor(theme, "borderStrong"),
      }}
    />
  );
}

/** The empty box a pupil writes one short answer into. */
export function AnswerBox({
  theme,
  widthMm,
  heightMm = 8,
}: {
  theme: Theme;
  widthMm?: number;
  heightMm?: number;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        width: widthMm === undefined ? "auto" : mm(widthMm),
        minWidth: mm(12),
        height: mm(heightMm),
        borderStyle: "solid",
        borderWidth: mm(theme.exerciseDefaults.answerRuleWidthMm),
        borderColor: resolveColor(theme, "borderStrong"),
      }}
    />
  );
}

/**
 * A framed area — a reading passage, a space for working out, a card layout.
 *
 * `surface` rather than a tint of the accent: the frame is there to say "this
 * belongs together", not to draw attention, and on a photocopier every tint
 * becomes the same grey anyway.
 */
export function PaperPanel({
  theme,
  children,
  padMm = 3,
}: {
  theme: Theme;
  children: ReactNode;
  padMm?: number;
}) {
  return (
    <div
      style={{
        borderStyle: "solid",
        borderWidth: mm(theme.borders.hairlineMm),
        borderColor: resolveColor(theme, "border"),
        borderRadius: mm(theme.radius.smallMm),
        padding: mm(padMm),
        backgroundColor: resolveColor(theme, "surface"),
      }}
    >
      {children}
    </div>
  );
}

/**
 * What an unfinished exercise says while the teacher is still writing it.
 *
 * Only ever rendered in `edit`. An exercise with no options prints as nothing,
 * so on screen it would be an invisible, unclickable block the teacher has no
 * way to select and finish — the same problem an empty paragraph has, solved
 * the same way.
 */
export function PaperHint({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <span style={{ color: resolveColor(theme, "textMuted"), opacity: 0.7 }}>
      {children}
    </span>
  );
}

/** Small print — a source line under a passage, a unit after a box. */
export function PaperNote({
  theme,
  children,
}: {
  theme: Theme;
  children: ReactNode;
}) {
  return (
    <span
      style={{ fontSize: "0.85em", color: resolveColor(theme, "textMuted") }}
    >
      {children}
    </span>
  );
}

/**
 * How the options of a question are arranged, driven by the block's layout.
 *
 * The five ids come from `@ludicon/evaluation`'s shared catalogue, so a type
 * that declares `"two-column"` gets two columns without knowing how they are
 * built. `card` arranges like `standard` — the card is the frame around the
 * whole exercise, drawn by `exercise-view.tsx`, not a change to the options.
 *
 * `grid` is `auto-fill` with a millimetre floor rather than a fixed count: the
 * same exercise sits in a full-width row on one page and a third of a row on
 * another, and a hard `repeat(4, …)` would produce four unreadable columns in
 * the narrow one.
 */
export function ItemRows({
  layoutId,
  gapMm = 1.6,
  children,
}: {
  layoutId: string;
  gapMm?: number;
  children: ReactNode;
}) {
  const style: CSSProperties =
    layoutId === "compact"
      ? {
          display: "flex",
          flexWrap: "wrap",
          columnGap: mm(gapMm * 3),
          rowGap: mm(gapMm),
        }
      : layoutId === "two-column"
        ? {
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            columnGap: mm(gapMm * 3),
            rowGap: mm(gapMm),
          }
        : layoutId === "grid"
          ? {
              display: "grid",
              gridTemplateColumns: `repeat(auto-fill, minmax(${mm(30)}, 1fr))`,
              columnGap: mm(gapMm * 2),
              rowGap: mm(gapMm),
            }
          : { display: "flex", flexDirection: "column", rowGap: mm(gapMm) };

  return <div style={style}>{children}</div>;
}

/**
 * One row of a question: a mark, what it says, and a mark on the other side.
 *
 * `align-items: flex-start` and not `baseline`, because an option that wraps
 * onto two lines would otherwise pull its "a)" down beside the second one.
 *
 * ## Both margins, because a pupil's pencil finds a column
 *
 * `trailing` exists for the shape that is the mirror of an option list — an
 * adevărat/fals pair, a numbering box for an ordering exercise printed on the
 * right — where the fixed part sits hard against the right margin and the
 * statement takes the measure. Two exercise types had written that row
 * privately before this slot existed, with their own gap constants, which is
 * exactly how two rows on the same sheet end up a millimetre apart.
 *
 * The middle span is `flex: 1 1 auto` so the trailing mark is pushed out rather
 * than following the text. In `compact`, where `ItemRows` sizes each row by its
 * content, there is nothing to grow into and the row behaves as it did before.
 */
export function ItemRow({
  label,
  trailing,
  children,
  gapMm = 1.6,
}: {
  label?: ReactNode;
  trailing?: ReactNode;
  children: ReactNode;
  gapMm?: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        columnGap: mm(gapMm),
        minWidth: 0,
      }}
    >
      {label === undefined ? null : (
        <span style={{ flex: "none" }}>{label}</span>
      )}
      <span style={{ flex: "1 1 auto", minWidth: 0 }}>{children}</span>
      {trailing === undefined ? null : (
        <span style={{ flex: "none", whiteSpace: "nowrap" }}>{trailing}</span>
      )}
    </div>
  );
}

/**
 * Two halves side by side, each with its own contents.
 *
 * For an exercise whose two columns are unrelated — a picture beside a set of
 * questions — where nothing on the left corresponds to anything on the right.
 * Use `SplitRows` below when they DO correspond; the difference is not
 * cosmetic, and getting it wrong is a matching exercise whose columns drift.
 */
export function SplitColumns({
  gapMm = 10,
  left,
  right,
}: {
  gapMm?: number;
  left: ReactNode;
  right: ReactNode;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: mm(gapMm),
      }}
    >
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}

/**
 * Two columns whose rows LINE UP, for a matching exercise.
 *
 * One grid holding every cell, not two stacks side by side. The difference is
 * the whole point: a pupil joins row three on the left to a row on the right by
 * drawing a line between them, and if the two columns are independent stacks
 * then a left-hand item that wraps onto a second line pushes everything below
 * it down and the two sides drift out of register. In one grid the row is the
 * row — CSS gives both cells the height of the taller — so a wrapped item moves
 * its own row on both sides and nothing below it loses its partner.
 *
 * The rejected fix was a fixed row height with the text clipped to fit. It
 * holds the rhythm and it loses a word off the end of a pupil's paper, which is
 * not a trade a printed evaluation may make.
 *
 * `minRowMm` keeps short items from sitting too close to draw between. It is a
 * floor, never a ceiling.
 */
export function SplitRows({
  gapMm = 10,
  minRowMm = 9,
  rows,
}: {
  gapMm?: number;
  minRowMm?: number;
  rows: readonly {
    readonly key: string;
    readonly left: ReactNode;
    readonly right: ReactNode;
  }[];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        columnGap: mm(gapMm),
        gridAutoRows: `minmax(${mm(minRowMm)}, auto)`,
      }}
    >
      {rows.map((row) => (
        <Fragment key={row.key}>
          <div>{row.left}</div>
          <div>{row.right}</div>
        </Fragment>
      ))}
    </div>
  );
}

/**
 * The label beside an option, and the ordinal beside a step.
 *
 * Both are re-exported from `@ludicon/evaluation` rather than written here,
 * because the barem computes the same strings without a DOM: a marking sheet
 * saying "c)" for the option a pupil reads as "d)" is a class marked wrongly
 * with nothing on either sheet looking out of place. One implementation, in the
 * half both can reach.
 *
 * The names differ from the package's — `optionLabel` rather than
 * `optionMarker` — because in this file everything is a thing drawn on paper,
 * and `paper.tsx` is where a renderer looks first.
 */
export { optionMarker as optionLabel, positionMarker as positionLabel };
