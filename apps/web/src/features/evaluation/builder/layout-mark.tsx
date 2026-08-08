import type { SectionLayout } from "@ludicon/evaluation";
import { cn } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";

/**
 * A row's shape, drawn small.
 *
 * The six layouts are named in Romanian and two of the names differ only in
 * word order — "O treime și două treimi" against "Două treimi și o treime". In
 * a list they are read one word at a time; as proportions they are told apart
 * at a glance. The mark is therefore a second channel beside the name in the
 * library, and in the inspector it is what makes six options fit a 311px rail
 * as one row instead of three.
 *
 * It lives in its own file because both panels draw it and both need the same
 * label for the same layout. Before this, `LAYOUT_LABEL` was declared twice,
 * once per panel, which is one copy away from the two surfaces disagreeing
 * about what a layout is called.
 */

export const LAYOUT_LABEL: Readonly<Record<SectionLayout, string>> =
  Object.freeze({
    "1": EVALUATION_COPY.rowFull,
    "1/2+1/2": EVALUATION_COPY.rowHalves,
    "1/3+2/3": EVALUATION_COPY.rowThirdTwoThirds,
    "2/3+1/3": EVALUATION_COPY.rowTwoThirdsThird,
    "1/3+1/3+1/3": EVALUATION_COPY.rowThirds,
    "1/4x4": EVALUATION_COPY.rowQuarters,
  });

/**
 * The proportions, as flex ratios rather than widths.
 *
 * Ratios survive the gap between the columns; percentages do not — two 50%
 * columns plus a gutter overflow their box by exactly one gutter, which is the
 * same arithmetic `section-view.tsx` avoids on the real page.
 */
const LAYOUT_COLUMNS: Readonly<Record<SectionLayout, readonly string[]>> =
  Object.freeze({
    "1": ["flex-1"],
    "1/2+1/2": ["flex-1", "flex-1"],
    "1/3+2/3": ["flex-1", "flex-[2_1_0%]"],
    "2/3+1/3": ["flex-[2_1_0%]", "flex-1"],
    "1/3+1/3+1/3": ["flex-1", "flex-1", "flex-1"],
    "1/4x4": ["flex-1", "flex-1", "flex-1", "flex-1"],
  });

export interface LayoutMarkProps {
  layout: SectionLayout;
}

/**
 * `aria-hidden` throughout: every caller already names the control in words,
 * and a mark that announced itself would say the layout twice.
 */
export function LayoutMark({ layout }: LayoutMarkProps) {
  return (
    <span
      aria-hidden
      className="flex h-5 w-7 shrink-0 gap-px rounded-[3px] p-0.5 ring-1 ring-border-strong"
    >
      {LAYOUT_COLUMNS[layout].map((width, index) => (
        <span key={index} className={cn("rounded-[1px] bg-subtle", width)} />
      ))}
    </span>
  );
}
