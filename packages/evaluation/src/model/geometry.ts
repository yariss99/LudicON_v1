import { z } from "zod";

/**
 * Millimetres, everywhere, always.
 *
 * The paper is the unit of truth: an A4 sheet is 210 x 297 mm on every screen,
 * at every zoom level, on every printer. Pixels were the rejected alternative —
 * they only mean something once a DPI and a zoom factor are known, and both of
 * those live in the browser, which this package deliberately cannot see. Storing
 * px would make the same document print differently depending on which machine
 * last edited it.
 *
 * Conversion to px happens at the edge, in `../layout/a4.ts`, and only ever on
 * the way out.
 */

/** A non-negative millimetre measurement. Capped well past any sane page. */
export const Millimetres = z.number().finite().min(0).max(2000);
export type Millimetres = z.infer<typeof Millimetres>;

/**
 * A millimetre coordinate that may sit outside the page.
 *
 * Negative values are legal on purpose: a cover decoration that bleeds off the
 * left edge is a design choice, not a data error. Clamping it here would make
 * the model quietly disagree with what the teacher sees on the canvas.
 */
export const MillimetresSigned = z.number().finite().min(-500).max(2000);
export type MillimetresSigned = z.infer<typeof MillimetresSigned>;

export const EdgeInsets = z.object({
  top: Millimetres.default(0),
  right: Millimetres.default(0),
  bottom: Millimetres.default(0),
  left: Millimetres.default(0),
});
export type EdgeInsets = z.infer<typeof EdgeInsets>;

export const SizeMm = z.object({
  width: Millimetres,
  height: Millimetres,
});
export type SizeMm = z.infer<typeof SizeMm>;

/** An axis-aligned rectangle in page millimetres, origin at the top-left. */
export const RectMm = z.object({
  x: MillimetresSigned,
  y: MillimetresSigned,
  width: Millimetres,
  height: Millimetres,
});
export type RectMm = z.infer<typeof RectMm>;

/**
 * The placement of a free block. Structurally a `RectMm`, aliased so the field
 * reads as what it means at the point of use.
 */
export const FreePlacement = RectMm;
export type FreePlacement = RectMm;

/** Uniform insets on all four sides. */
export const uniformInsets = (value: number): EdgeInsets => ({
  top: value,
  right: value,
  bottom: value,
  left: value,
});

export const horizontalInset = (insets: EdgeInsets): number =>
  insets.left + insets.right;

export const verticalInset = (insets: EdgeInsets): number =>
  insets.top + insets.bottom;

/** Shrinks a size by its insets, never below zero. */
export const insetSize = (size: SizeMm, insets: EdgeInsets): SizeMm => ({
  width: Math.max(0, size.width - horizontalInset(insets)),
  height: Math.max(0, size.height - verticalInset(insets)),
});

export const rectContains = (outer: RectMm, inner: RectMm): boolean =>
  inner.x >= outer.x &&
  inner.y >= outer.y &&
  inner.x + inner.width <= outer.x + outer.width &&
  inner.y + inner.height <= outer.y + outer.height;
