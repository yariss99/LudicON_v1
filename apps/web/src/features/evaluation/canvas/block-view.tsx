import { createElement, type CSSProperties } from "react";
import {
  A4,
  BLOCK_KIND_LABEL,
  isEmptyInline,
  paintBlockStyle,
  resolveBlockStyle,
  resolveColor,
  type AnswerSpaceBlock,
  type Block,
  type ListStyle,
  type PaintedBlockStyle,
  type Theme,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";
import { ExerciseView } from "../exercises/exercise-view";
import { InlineView } from "./inline-view";
import { mm, pt } from "./mm";

/**
 * One piece, drawn from the model and nothing else.
 *
 * There is no selection state, no hover handling and no editing affordance in
 * this file, and that is the constraint the whole canvas is built around: the
 * same component has to produce the printed sheet and the PDF, where none of
 * those things exist. Anything the teacher can click is layered over the page
 * by `editor-overlay.tsx`, positioned by measuring what this drew.
 *
 * Colour comes from the model, through `resolveBlockStyle` and
 * `paintBlockStyle`, and lands as inline hex. That is the one place in this app
 * where a literal colour is correct: it is the teacher's own choice, stored as
 * data, not a design-system decision — and the product's semantic tokens would
 * be wrong here twice over, because they follow the reader's light/dark
 * preference and a printed page does not have one.
 *
 * `mode` is not decoration. In `edit` an empty paragraph shows a faint hint, so
 * a piece that prints as nothing is still findable and clickable; in `preview`
 * it renders as the blank it will actually be.
 */

export type RenderMode = "edit" | "preview";

const LIST_MARKER: Readonly<Record<ListStyle, string>> = Object.freeze({
  bullet: "disc",
  numbered: "decimal",
  lettered: "lower-alpha",
  none: "none",
});

/** The three kinds the next slice fills in; drawn as a reserved area for now. */
const PLACEHOLDER_KINDS = new Set<Block["kind"]>(["quote", "table", "callout"]);

/**
 * The box a block sits in.
 *
 * `framed` exists for exactly one kind. `resolve.ts` gives an answer space the
 * theme's `answerRuleWidthMm` and `answerRuleColor` as its `borderWidthMm` and
 * `borderColor` — those numbers are the pupil's WRITING RULE, not a frame — so
 * drawing them here would put a hairline rectangle around a set of ruled lines
 * and print a box nobody asked for. The alternative, giving the answer space a
 * private style path that never reaches `resolveBlockStyle`, would take it out
 * of the one function the canvas, the print surface and the PDF worker all
 * agree through.
 */
const boxStyle = (style: PaintedBlockStyle, framed = true): CSSProperties => ({
  color: style.color,
  backgroundColor: style.background ?? undefined,
  fontSize: pt(style.fontSizePt),
  fontWeight: style.fontWeight,
  lineHeight: style.lineHeight,
  letterSpacing: `${style.letterSpacingEm}em`,
  textAlign: style.align,
  paddingTop: mm(style.padding.top),
  paddingRight: mm(style.padding.right),
  paddingBottom: mm(style.padding.bottom),
  paddingLeft: mm(style.padding.left),
  marginTop: mm(style.marginTopMm),
  marginBottom: mm(style.marginBottomMm),
  borderRadius: mm(style.radiusMm),
  ...(framed && style.borderWidthMm > 0 && style.borderColor
    ? {
        borderStyle: "solid",
        borderWidth: mm(style.borderWidthMm),
        borderColor: style.borderColor,
      }
    : {}),
});

function Hint({ theme, children }: { theme: Theme; children: string }) {
  return (
    <span style={{ color: resolveColor(theme, "textMuted"), opacity: 0.6 }}>
      {children}
    </span>
  );
}

/**
 * A band the teacher can see and click, for a piece that prints as nothing.
 *
 * The same device `section-view.tsx` uses for an empty row, and drawn from the
 * theme's own colours rather than the product's semantic tokens for the same
 * reason: it sits on the teacher's paper, which has no light and dark mode.
 * Only ever spread in `edit` — `preview` is the truth or it is not a preview.
 */
const reservedBand = (theme: Theme): CSSProperties => ({
  minHeight: mm(14),
  borderStyle: "dashed",
  borderWidth: mm(0.3),
  borderColor: resolveColor(theme, "borderStrong"),
  color: resolveColor(theme, "textMuted"),
  display: "flex",
  alignItems: "center",
  paddingLeft: mm(3),
});

/**
 * Below this a "grid" is a grey rectangle, not squared paper.
 *
 * `lineGapMm` is only bounded by `Millimetres` (0 to 2000), so a zero or a
 * fraction of a millimetre is storable — and a zero divides by zero when the
 * column count is worked out. Clamping is the honest response: the block still
 * draws, at the finest ruling a pupil could actually write between.
 */
const LEAST_GAP_MM = 2;

/**
 * Where the pupil writes.
 *
 * ## Borders, never a background gradient
 *
 * `repeating-linear-gradient` is the short way to rule a box and it is the
 * wrong one HERE: it is a background image, and Chrome, Edge and Firefox all
 * default to not printing background graphics — `print.css` says so at length.
 * A teacher who did not tick "Grafică de fundal" would hand out the empty box
 * this defect already produced. Borders are content; they print regardless of
 * that setting, so the lines are real elements with real rules.
 *
 * ## Every number comes off the block or the theme
 *
 * `answerStyle`, `lines`, `lineGapMm` and `heightMm` are all on
 * `AnswerSpaceBlock`; the rule's width and colour arrive as the resolved
 * style's `borderWidthMm` / `borderColor`, which `resolve.ts` fills from
 * `theme.exerciseDefaults.answerRuleWidthMm` and `answerRuleColor`. Nothing is
 * invented. The one figure the schema does not carry is a height for `box` and
 * `blank` when `heightMm` is null — its default — so those fall back to
 * `lines × lineGapMm`, the block's own two numbers, rather than to a constant
 * this file would have made up.
 *
 * ## What prints as nothing still has to be findable
 *
 * `blank` is reserved white space by definition, and a `lines` space with zero
 * lines is the same thing by arithmetic. In `edit` both reserve a band naming
 * themselves, so a teacher who placed one can see and click it; in `preview`
 * they are the blank they will actually be. The rejected alternative was
 * drawing a faint rule in preview too, which is a mark on a printed paper that
 * no one chose to put there.
 */
function AnswerSpaceView({
  block,
  theme,
  style,
  editing,
}: {
  block: AnswerSpaceBlock;
  theme: Theme;
  style: PaintedBlockStyle;
  editing: boolean;
}) {
  const box = boxStyle(style, false);
  const gapMm = Math.max(LEAST_GAP_MM, block.lineGapMm);
  const rule = mm(style.borderWidthMm);
  const ruleColor = style.borderColor ?? resolveColor(theme, "rule");

  if (block.answerStyle === "lines" && block.lines > 0) {
    return (
      <div data-block-id={block.id} style={box}>
        {Array.from({ length: block.lines }, (_, index) => (
          <div
            key={index}
            style={{
              boxSizing: "border-box",
              height: mm(gapMm),
              borderBottomStyle: "solid",
              borderBottomWidth: rule,
              borderBottomColor: ruleColor,
            }}
          />
        ))}
      </div>
    );
  }

  if (block.answerStyle === "grid" && block.lines > 0) {
    /**
     * The column count is bounded by the SHEET, then clipped by the column.
     *
     * A block is not told how wide it is — `section-view.tsx` computes column
     * widths and hands down nothing else — so the lattice is drawn wide enough
     * for the widest a column could ever be (a full 210mm A4) and `overflow:
     * hidden` trims it to the measure it actually got. A half square at the
     * right edge is what trimmed squared paper looks like. Measuring the column
     * instead would need a layout pass inside a component that must stay a pure
     * function of the model.
     */
    const columns = Math.ceil(A4.width / gapMm);
    return (
      <div
        data-block-id={block.id}
        style={{
          ...box,
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, ${mm(gapMm)})`,
          gridAutoRows: mm(gapMm),
          overflow: "hidden",
          borderTopStyle: "solid",
          borderTopWidth: rule,
          borderTopColor: ruleColor,
          borderLeftStyle: "solid",
          borderLeftWidth: rule,
          borderLeftColor: ruleColor,
        }}
      >
        {Array.from({ length: block.lines * columns }, (_, index) => (
          <div
            key={index}
            style={{
              boxSizing: "border-box",
              borderRightStyle: "solid",
              borderRightWidth: rule,
              borderRightColor: ruleColor,
              borderBottomStyle: "solid",
              borderBottomWidth: rule,
              borderBottomColor: ruleColor,
            }}
          />
        ))}
      </div>
    );
  }

  const heightMm = block.heightMm ?? block.lines * gapMm;

  if (block.answerStyle === "box") {
    return (
      <div
        data-block-id={block.id}
        style={{
          ...box,
          boxSizing: "border-box",
          height: mm(heightMm),
          borderStyle: "solid",
          borderWidth: rule,
          borderColor: ruleColor,
        }}
      />
    );
  }

  return (
    <div
      data-block-id={block.id}
      style={{
        ...box,
        boxSizing: "border-box",
        height: mm(heightMm),
        ...(editing ? reservedBand(theme) : {}),
      }}
    >
      {editing ? BLOCK_KIND_LABEL[block.kind] : null}
    </div>
  );
}

export interface BlockViewProps {
  block: Block;
  theme: Theme;
  mode: RenderMode;
}

export function BlockView({ block, theme, mode }: BlockViewProps) {
  const style = paintBlockStyle(theme, resolveBlockStyle(theme, block));
  const base = boxStyle(style);
  const editing = mode === "edit";

  if (PLACEHOLDER_KINDS.has(block.kind)) {
    return (
      <div
        data-block-id={block.id}
        style={{
          ...base,
          minHeight: mm(14),
          ...(editing ? reservedBand(theme) : {}),
        }}
      >
        {editing
          ? EVALUATION_COPY.pieceSoon(BLOCK_KIND_LABEL[block.kind])
          : null}
      </div>
    );
  }

  switch (block.kind) {
    /**
     * An exercise is drawn by the exercise system, not by this switch.
     *
     * Its body depends on a registry entry — a `single-choice` draws options, a
     * `matching` draws two columns — so a case here would have to be a second
     * switch over every type in the product, and adding a type would mean
     * editing this file. `ExerciseView` looks the type up and hands off; this
     * file keeps knowing only that an exercise is one block among twelve.
     */
    case "exercise":
      return <ExerciseView block={block} theme={theme} mode={mode} />;

    /**
     * The rules are drawn from the resolved style, not from `base`.
     *
     * `base` would carry the answer rule round all four sides as a frame — see
     * `boxStyle`'s `framed` — so this case takes the painted style and lets
     * `AnswerSpaceView` decide which edges the rule belongs on.
     */
    case "answerSpace":
      return (
        <AnswerSpaceView
          block={block}
          theme={theme}
          style={style}
          editing={editing}
        />
      );

    /**
     * `createElement` rather than a `<Heading>` variable in JSX: the tag is a
     * four-member union, and a JSX element whose type is a union of intrinsics
     * makes TypeScript intersect four prop tables to check one `style`.
     */
    case "heading":
      return createElement(
        block.level,
        { "data-block-id": block.id, style: base },
        isEmptyInline(block.content) && editing ? (
          <Hint theme={theme}>{EVALUATION_COPY.emptyTextHint}</Hint>
        ) : (
          <InlineView nodes={block.content} />
        ),
      );

    case "paragraph":
      return (
        <p data-block-id={block.id} style={base}>
          {isEmptyInline(block.content) && editing ? (
            <Hint theme={theme}>{EVALUATION_COPY.emptyTextHint}</Hint>
          ) : (
            <InlineView nodes={block.content} />
          )}
        </p>
      );

    case "list": {
      const listStyle: CSSProperties = {
        ...base,
        listStyleType: LIST_MARKER[block.listStyle],
      };
      const items = block.items.map((item, index) => (
        <li key={index}>
          {isEmptyInline(item) && editing ? (
            <Hint theme={theme}>{EVALUATION_COPY.emptyTextHint}</Hint>
          ) : (
            <InlineView nodes={item} />
          )}
        </li>
      ));

      // Two branches rather than one dynamic tag: `start` belongs to `<ol>`
      // alone, so a shared element would have to lie about its props.
      return block.listStyle === "numbered" ? (
        <ol data-block-id={block.id} start={block.startAt} style={listStyle}>
          {items}
        </ol>
      ) : (
        <ul data-block-id={block.id} style={listStyle}>
          {items}
        </ul>
      );
    }

    case "image":
      return (
        <figure
          data-block-id={block.id}
          style={{
            ...base,
            display: "flex",
            flexDirection: "column",
            alignItems:
              block.align === "left"
                ? "flex-start"
                : block.align === "right"
                  ? "flex-end"
                  : "center",
          }}
        >
          {block.src.trim() === "" ? (
            <div
              style={{
                width: mm(block.widthMm ?? 60),
                height: mm(block.heightMm ?? 40),
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderStyle: "dashed",
                borderWidth: mm(0.3),
                borderColor: resolveColor(theme, "borderStrong"),
                color: resolveColor(theme, "textMuted"),
              }}
            >
              {editing ? EVALUATION_COPY.emptyImageHint : null}
            </div>
          ) : (
            <img
              src={block.src}
              alt={block.alt}
              style={{
                width: block.widthMm === null ? "100%" : mm(block.widthMm),
                height: block.heightMm === null ? "auto" : mm(block.heightMm),
                objectFit: block.fit,
              }}
            />
          )}
          {isEmptyInline(block.caption) ? null : (
            <figcaption style={{ marginTop: mm(2) }}>
              <InlineView nodes={block.caption} />
            </figcaption>
          )}
        </figure>
      );

    case "divider":
      return (
        <div
          data-block-id={block.id}
          role="separator"
          style={{
            marginTop: mm(style.marginTopMm),
            marginBottom: mm(style.marginBottomMm),
            borderTopStyle: block.dividerStyle,
            borderTopWidth: mm(block.thicknessMm),
            borderTopColor: style.borderColor ?? resolveColor(theme, "border"),
          }}
        />
      );

    case "spacer":
      return (
        <div
          data-block-id={block.id}
          aria-hidden
          style={{ height: mm(block.heightMm) }}
        />
      );

    /**
     * A frame's children are drawn where the frame is, so a frame that reaches
     * this file is one on a page that does not allow free placement — which the
     * validator reports. Drawing nothing is the honest answer.
     */
    default:
      return null;
  }
}
