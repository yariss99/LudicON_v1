import type { CSSProperties } from "react";
import {
  columnGapFor,
  columnWidthsMm,
  horizontalInset,
  resolveBlocks,
  resolveColor,
  type EvaluationProject,
  type Section,
  type Theme,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";
import { BlockView, type RenderMode } from "./block-view";
import { mm } from "./mm";

/**
 * One row of the page, and its columns.
 *
 * Column widths are computed in MILLIMETRES by the model's `columnWidthsMm`
 * rather than as CSS percentages. The two are not equivalent: percentages split
 * the full measure and then the gutters are added on top, so two "50%" columns
 * plus a 6mm gutter overflow the content box by exactly one gutter. The model
 * subtracts the gutters first and gives the last column the rounding, which is
 * what makes the seam land in the same place here and in the PDF worker — and
 * the worker has no browser to ask.
 *
 * `flex` is `0 0 <width>` rather than a basis with grow: a column that can grow
 * would silently absorb the rounding the model already assigned, and a wide
 * unbroken word would win the argument with the layout.
 *
 * ## An empty column reserves space while editing
 *
 * A row with nothing in it has no height, so adding one drew literally nothing
 * on the paper: the library's most-used buttons appeared to do nothing at all,
 * and the only evidence anything had happened was a selection outline four
 * pixels tall. In `edit` the empty columns therefore reserve a band and say
 * what goes in it — the same device `block-view.tsx` already uses for the kinds
 * it cannot draw yet, and for the same reason, so the teacher can see and click
 * the thing they just made.
 *
 * In `preview` it is gone, because an empty row prints as nothing and the
 * preview has to be the truth. That is also why this is drawn from the theme's
 * own colours rather than the product's tokens: it sits on the teacher's paper,
 * which has no light and dark.
 */

export interface SectionViewProps {
  section: Section;
  document: EvaluationProject;
  theme: Theme;
  mode: RenderMode;
  /** Width of the page's content box, in millimetres. */
  contentWidthMm: number;
}

export function SectionView({
  section,
  document,
  theme,
  mode,
  contentWidthMm,
}: SectionViewProps) {
  const { style } = section;
  const gap = style.columnGapMm || columnGapFor(theme, section.layout);
  const inner = Math.max(0, contentWidthMm - horizontalInset(style.padding));
  const widths = columnWidthsMm(inner, section.layout, gap);

  const border = style.border;
  const frame: CSSProperties = border
    ? {
        borderStyle: "solid",
        borderColor: resolveColor(theme, border.color),
        borderTopWidth: border.sides.top ? mm(border.widthMm) : 0,
        borderRightWidth: border.sides.right ? mm(border.widthMm) : 0,
        borderBottomWidth: border.sides.bottom ? mm(border.widthMm) : 0,
        borderLeftWidth: border.sides.left ? mm(border.widthMm) : 0,
      }
    : {};

  return (
    <section
      data-section-id={section.id}
      style={{
        display: "flex",
        gap: mm(gap),
        alignItems: "flex-start",
        paddingTop: mm(style.padding.top),
        paddingRight: mm(style.padding.right),
        paddingBottom: mm(style.padding.bottom),
        paddingLeft: mm(style.padding.left),
        marginBottom: mm(style.spacingBelowMm),
        borderRadius: mm(style.radiusMm),
        backgroundColor: style.background
          ? resolveColor(theme, style.background)
          : undefined,
        ...frame,
      }}
    >
      {section.columns.map((column, index) => {
        const blocks = resolveBlocks(document, column.blockOrder);
        return (
          <div
            key={column.id}
            data-column-id={column.id}
            style={{ flex: `0 0 ${mm(widths[index] ?? 0)}`, minWidth: 0 }}
          >
            {blocks.length === 0 && mode === "edit" ? (
              <EmptyColumn theme={theme} />
            ) : (
              blocks.map((block) => (
                <BlockView
                  key={block.id}
                  block={block}
                  theme={theme}
                  mode={mode}
                />
              ))
            )}
          </div>
        );
      })}
    </section>
  );
}

/**
 * 14mm is the height of one line of body type plus its margins, so a row that
 * is about to hold a paragraph is already the size it will be — nothing jumps
 * when the first piece lands in it.
 */
function EmptyColumn({ theme }: { theme: Theme }) {
  return (
    <div
      style={{
        minHeight: mm(14),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderStyle: "dashed",
        borderWidth: mm(0.3),
        borderColor: resolveColor(theme, "borderStrong"),
        color: resolveColor(theme, "textMuted"),
        fontSize: mm(3.6),
        textAlign: "center",
        padding: mm(2),
      }}
    >
      {EVALUATION_COPY.emptyRowHint}
    </div>
  );
}
