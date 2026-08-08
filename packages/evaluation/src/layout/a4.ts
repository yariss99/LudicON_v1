import type { RectMm, SizeMm } from "../model/geometry.js";
import { horizontalInset } from "../model/geometry.js";
import type { Page, PageSetup } from "../model/page.js";
import {
  effectivePageSetup,
  footerHeightMm,
  headerHeightMm,
} from "../model/page.js";
import type { SectionLayout } from "../model/section-layout.js";
import { columnSpans, SECTION_GRID_UNITS } from "../model/section-layout.js";

/**
 * A4 geometry, in millimetres, by pure arithmetic.
 *
 * There is no measurement here and there cannot be: this package has no DOM, on
 * purpose. The PDF worker and the server-side print path run in Node with no
 * layout engine, and they need the same content box the browser canvas uses. If
 * that number came from `getBoundingClientRect`, the two would agree only by
 * luck, and the discrepancy would show up as a paper that paginates differently
 * when exported than when previewed.
 *
 * What genuinely needs measurement — how tall a paragraph of Romanian text
 * actually renders at 11pt — stays in the app, which has a browser to ask.
 */

export const MM_PER_INCH = 25.4;

/** A4 in portrait. Landscape swaps the two — see `pageSize`. */
export const A4: Readonly<SizeMm> = Object.freeze({
  width: 210,
  height: 297,
});

/**
 * CSS's fixed reference: 1in === 96px, regardless of the real display. It is
 * what `mm` units in a stylesheet resolve against, so it is the right number
 * for anything that will end up in CSS.
 */
export const CSS_DPI = 96;

/** The usual target for rasterised print output. */
export const PRINT_DPI = 300;

export const mmToPx = (mm: number, dpi: number = CSS_DPI): number =>
  (mm / MM_PER_INCH) * dpi;

export const pxToMm = (px: number, dpi: number = CSS_DPI): number =>
  (px / dpi) * MM_PER_INCH;

export const ptToMm = (pt: number): number => (pt / 72) * MM_PER_INCH;

export const mmToPt = (mm: number): number => (mm / MM_PER_INCH) * 72;

/** The sheet, oriented. */
export const pageSize = (setup: PageSetup): SizeMm =>
  setup.orientation === "landscape"
    ? { width: A4.height, height: A4.width }
    : { width: A4.width, height: A4.height };

/**
 * The rectangle content may occupy: the sheet less its margins, less whatever
 * the running header and footer reserve.
 *
 * `isFirstPage` matters because a header can be suppressed on the cover, and a
 * cover with a header's worth of dead space at the top is a cover nobody
 * designed.
 */
export const contentBox = (setup: PageSetup, isFirstPage = false): RectMm => {
  const size = pageSize(setup);
  const header = headerHeightMm(setup, isFirstPage);
  const footer = footerHeightMm(setup, isFirstPage);

  return {
    x: setup.margins.left,
    y: setup.margins.top + header,
    width: Math.max(0, size.width - horizontalInset(setup.margins)),
    height: Math.max(
      0,
      size.height - setup.margins.top - setup.margins.bottom - header - footer,
    ),
  };
};

/** The content box of one specific page, honouring its overrides. */
export const pageContentBox = (
  setup: PageSetup,
  page: Page,
  isFirstPage = false,
): RectMm => contentBox(effectivePageSetup(setup, page), isFirstPage);

/**
 * Column widths in millimetres for a layout across a given content width.
 *
 * The gutters are subtracted first and the remainder split by grid units, which
 * is what makes two 1/2 columns the same width rather than each being half the
 * full measure and overflowing by one gutter. The last column absorbs the
 * rounding so the widths and the gutters add back up to exactly `contentWidth`
 * — a sub-millimetre shortfall is invisible on screen and a visible seam in
 * print.
 */
export const columnWidthsMm = (
  contentWidth: number,
  layout: SectionLayout,
  gapMm: number,
): number[] => {
  const spans = columnSpans(layout);
  const gutters = gapMm * Math.max(0, spans.length - 1);
  const available = Math.max(0, contentWidth - gutters);

  const widths = spans.map((span) => (available * span) / SECTION_GRID_UNITS);
  const assigned = widths.slice(0, -1).reduce((sum, width) => sum + width, 0);

  return widths.map((width, index) =>
    index === widths.length - 1 ? available - assigned : width,
  );
};

/**
 * The x offset of each column within the content box, given those widths.
 * Returned separately from the widths because a renderer usually needs both and
 * computing offsets from widths is the kind of loop that gets written twice.
 */
export const columnOffsetsMm = (
  widths: readonly number[],
  gapMm: number,
): number[] => {
  const offsets: number[] = [];
  let cursor = 0;
  for (const width of widths) {
    offsets.push(cursor);
    cursor += width + gapMm;
  }
  return offsets;
};
