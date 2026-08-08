import { z } from "zod";

/**
 * Section layouts are a LOOKUP TABLE, not a set of branches.
 *
 * The rejected alternative was a `switch (layout)` in every consumer that needs
 * column widths — the canvas, the print renderer, the PDF pipeline, the
 * thumbnail. Adding `1/5+4/5` would then mean finding and editing four
 * switches, and forgetting one would ship a layout that renders correctly in
 * the editor and wrongly on paper.
 *
 * Here, a layout IS its row in `SECTION_LAYOUT_COLUMNS`. Adding one is: add the
 * enum member, add the row. Every consumer reads `columnSpans(layout)` and
 * needs no change at all.
 */

export const SectionLayout = z.enum([
  "1",
  "1/2+1/2",
  "1/3+2/3",
  "2/3+1/3",
  "1/3+1/3+1/3",
  "1/4x4",
]);
export type SectionLayout = z.infer<typeof SectionLayout>;

/**
 * The grid is 12 units wide because 12 is divisible by 2, 3 and 4 — every
 * layout in the table below, and the sixths and twelfths we have not invented
 * yet, land on whole units. A 100-unit percentage grid would make thirds
 * repeating decimals and put a sub-millimetre seam between columns on paper.
 */
export const SECTION_GRID_UNITS = 12;

const LAYOUT_COLUMNS: Readonly<Record<SectionLayout, readonly number[]>> =
  Object.freeze({
    "1": Object.freeze([12]),
    "1/2+1/2": Object.freeze([6, 6]),
    "1/3+2/3": Object.freeze([4, 8]),
    "2/3+1/3": Object.freeze([8, 4]),
    "1/3+1/3+1/3": Object.freeze([4, 4, 4]),
    "1/4x4": Object.freeze([3, 3, 3, 3]),
  });

export const SECTION_LAYOUT_COLUMNS = LAYOUT_COLUMNS;

/** Teacher-facing Romanian labels for the layout picker (UX-001: no jargon). */
export const SECTION_LAYOUT_LABEL: Readonly<Record<SectionLayout, string>> =
  Object.freeze({
    "1": "O coloană",
    "1/2+1/2": "Două coloane egale",
    "1/3+2/3": "Coloană îngustă, apoi lată",
    "2/3+1/3": "Coloană lată, apoi îngustă",
    "1/3+1/3+1/3": "Trei coloane egale",
    "1/4x4": "Patru coloane egale",
  });

export const SECTION_LAYOUT_ORDER: readonly SectionLayout[] = Object.freeze([
  "1",
  "1/2+1/2",
  "1/3+2/3",
  "2/3+1/3",
  "1/3+1/3+1/3",
  "1/4x4",
]);

/** Column spans, in grid units, for a layout. Always sums to SECTION_GRID_UNITS. */
export const columnSpans = (layout: SectionLayout): readonly number[] =>
  LAYOUT_COLUMNS[layout];

export const columnCount = (layout: SectionLayout): number =>
  LAYOUT_COLUMNS[layout].length;

/**
 * The fraction of the content width each column occupies.
 *
 * Consumers that lay out in millimetres should prefer
 * `../layout/a4.ts#columnWidthsMm`, which also subtracts the gutters. This one
 * is for callers that only need proportions (a CSS `grid-template-columns`, a
 * thumbnail).
 */
export const columnFractions = (layout: SectionLayout): readonly number[] =>
  LAYOUT_COLUMNS[layout].map((span) => span / SECTION_GRID_UNITS);
