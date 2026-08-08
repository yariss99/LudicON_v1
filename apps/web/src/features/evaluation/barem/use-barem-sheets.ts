import { useLayoutEffect, useRef, useState, type RefObject } from "react";
import { mmToPx } from "@ludicon/evaluation";

import type { BaremRow } from "./barem-rows";

/**
 * How many barem rows fit on a sheet — measured, because nothing else can know.
 *
 * The paper paginates itself: a teacher decides what goes on page two, and one
 * modelled `Page` is one 210×297mm box. The barem has no such structure — it is
 * a list whose rows are as tall as the answers the teacher typed — so if it is
 * to print on A4 sheets that match the paper, something has to measure it.
 *
 * ## Why not let the browser paginate it
 *
 * The obvious version is one flowing block with `break-inside: avoid` on each
 * row, and it is wrong for one reason that only appears from the second page
 * on. `@page { margin: 0 }` is required by the paper — the document carries its
 * own margins — so a flowing barem gets its margins from its container's
 * padding, and container padding applies at the START and END of the flow, not
 * at each page boundary. Page two of the barem would begin hard against the top
 * edge of the paper. CSS named pages (`page: barem` plus its own `@page` rule)
 * do solve it and are not yet safe to rely on across the browsers teachers
 * actually have.
 *
 * So the barem is cut into real sheets, each one an A4 box with the paper's own
 * margins, which also means the two printouts look like the same document — and
 * `break-before: page` in `print.css` treats a barem sheet exactly like a page
 * of the paper, with no special case.
 *
 * ## The measuring pass
 *
 * Two renders, both inside the hidden print surface, so neither is ever seen.
 * The first draws every row at the sheet's content width and this hook reads
 * their heights; the second draws the sheets. `useLayoutEffect` rather than
 * `useEffect` so the second render happens before the browser paints, which is
 * what keeps the surface from being caught half-measured by `window.print()`.
 *
 * Heights are read with `getBoundingClientRect().height` rather than
 * `offsetHeight`: the latter rounds to whole pixels, and rounding twelve rows
 * up can lose most of a line of type off the bottom of a sheet.
 */

export interface BaremSheetMetrics {
  /** The content box of one sheet, in millimetres — the paper's own. */
  readonly contentWidthMm: number;
  readonly contentHeightMm: number;
  /** The title band, drawn on the first sheet only. */
  readonly headMm: number;
  /** The band the total sits in, reserved on every sheet — see below. */
  readonly footMm: number;
}

export interface BaremSheets {
  /**
   * Rows grouped per sheet, or `null` while the rows for this document have not
   * been measured yet. `null` is what tells the component to render the
   * measuring pass instead.
   */
  readonly sheets: readonly (readonly BaremRow[])[] | null;
  /** Goes on the container of the measuring pass. */
  readonly measureRef: RefObject<HTMLDivElement | null>;
}

/**
 * The total's band is reserved on EVERY sheet, not only the last.
 *
 * Reserving it only where it is drawn needs the chunking to know which sheet is
 * last, which it does not until it has finished — a loop that has to be run
 * twice and re-run whenever a row lands on a boundary. The cost of the simple
 * version is up to `footMm` of unused space at the bottom of the sheets before
 * the last one, which on a marking sheet nobody will ever notice; the cost of
 * the clever version is a pagination pass with an edge case in it.
 */
const chunk = (
  rows: readonly BaremRow[],
  heightsPx: readonly number[],
  firstAvailablePx: number,
  restAvailablePx: number,
): BaremRow[][] => {
  const sheets: BaremRow[][] = [];
  let current: BaremRow[] = [];
  let used = 0;

  for (const [index, row] of rows.entries()) {
    const height = heightsPx[index] ?? 0;
    const available = sheets.length === 0 ? firstAvailablePx : restAvailablePx;

    /**
     * A row taller than a whole sheet still starts a sheet of its own rather
     * than being dropped or split: `current.length > 0` is what stops the loop
     * emitting an empty sheet in front of it. It will overflow, and overflowing
     * is the honest outcome — the alternative is silently losing a marking
     * instruction the teacher wrote.
     */
    if (current.length > 0 && used + height > available) {
      sheets.push(current);
      current = [];
      used = 0;
    }

    current.push(row);
    used += height;
  }

  if (current.length > 0) sheets.push(current);
  return sheets;
};

export const useBaremSheets = (
  rows: readonly BaremRow[],
  metrics: BaremSheetMetrics,
): BaremSheets => {
  const measureRef = useRef<HTMLDivElement | null>(null);

  /**
   * The measurement is stored WITH the rows it was taken from.
   *
   * Without that key, editing the paper would leave the previous document's
   * pagination on screen for one render — and one render is exactly long enough
   * for `window.print()` to catch it, because printing is the very next thing
   * that happens.
   */
  const [measured, setMeasured] = useState<{
    readonly rows: readonly BaremRow[];
    readonly sheets: BaremRow[][];
  } | null>(null);

  const millimetre = mmToPx(1);
  const firstAvailablePx =
    (metrics.contentHeightMm - metrics.headMm - metrics.footMm) * millimetre;
  const restAvailablePx =
    (metrics.contentHeightMm - metrics.footMm) * millimetre;

  useLayoutEffect(() => {
    const node = measureRef.current;
    if (!node) return;

    const heights = [...node.children].map(
      (child) => child.getBoundingClientRect().height,
    );

    setMeasured({
      rows,
      sheets: chunk(rows, heights, firstAvailablePx, restAvailablePx),
    });
  }, [rows, firstAvailablePx, restAvailablePx]);

  return {
    sheets: measured && measured.rows === rows ? measured.sheets : null,
    measureRef,
  };
};
