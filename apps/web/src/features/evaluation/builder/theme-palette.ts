import {
  HexColor,
  isForbiddenBrandHue,
  type ColorToken,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";

/**
 * The colours a teacher may choose from, and the gate every other colour passes.
 *
 * ## Why there is no hue wheel
 *
 * A wheel offers 360 degrees, 78 of which this product forbids — Design Book
 * CH01 §12.2 says five separate times that purple, indigo and violet are not
 * ours. A control that offers a choice and then refuses it is a control that
 * teaches the teacher the product is broken. So the primary picker is a set of
 * named swatches, all of which are already legal, and the wheel does not exist.
 *
 * A custom hex field is still offered, because a school with a crest in a
 * specific green has a real need the swatches cannot meet. It goes through
 * `isForbiddenBrandHue` from `@ludicon/evaluation`, which owns the measured
 * 232°-310° band and the saturation floor that keeps dark navy inks out of the
 * net. What happens on a refusal is stated rather than silent: the field says
 * so, and the previous colour stays — see `colorRefusedBanned` in
 * `../copy.ts`. Clamping the hue to the nearest legal one was the rejected
 * alternative: a teacher who typed indigo and got blue would reasonably think
 * the field was broken, and would type it again.
 *
 * ## Why there are hexes in this file
 *
 * These are DOCUMENT DATA, not design-system decisions. They are the values
 * written into `theme.colors`, which the canvas then paints inline — the same
 * exception `packages/evaluation/src/theme/default-theme.ts` is built on, and
 * the same reason `block-view.tsx` is allowed to emit a literal colour. Every
 * hex below is copied from `packages/ui/src/styles/palette.css` with its
 * variable named beside it, so the product's colours still change in exactly
 * one place. Nothing here is a chrome colour and nothing here becomes a class.
 */

export interface Swatch {
  readonly hex: HexColor;
  /** Romanian, spoken by the swatch's accessible name. */
  readonly name: string;
}

const swatch = (hex: string, name: string): Swatch => ({
  hex: hex as HexColor,
  name,
});

const N = EVALUATION_COPY.swatchName;

/** Dark enough to set type in. Used for ink, headings and frame lines. */
const INKS: readonly Swatch[] = Object.freeze([
  swatch("#0f172a", N.ink), // --p-ink-900
  swatch("#475569", N.inkSoft), // --p-ink-600
  swatch("#64748b", N.slate), // --p-ink-500
  swatch("#94a3b8", N.silver), // --p-ink-400
  swatch("#e2e8f0", N.mist), // --p-ink-200
  swatch("#1d4ed8", N.blueDeep), // --p-blue-700
  swatch("#047857", N.greenDeep), // --p-emerald-700
  swatch("#b45309", N.amber), // --p-amber-700
  swatch("#b91c1c", N.redDeep), // --p-red-700
]);

/**
 * Carries meaning at a glance, so it is saturated rather than merely dark.
 *
 * Amber and red are in here even though the palette file reserves them for
 * attention and for true failures. That reservation is about the PRODUCT's
 * chrome; on a teacher's own paper an amber heading is a heading, and refusing
 * it would be the design system telling a teacher what their evaluation may
 * mean.
 */
const ACCENTS: readonly Swatch[] = Object.freeze([
  swatch("#2563eb", N.blue), // --p-blue-600
  swatch("#1d4ed8", N.blueDeep), // --p-blue-700
  swatch("#059669", N.green), // --p-emerald-600
  swatch("#047857", N.greenDeep), // --p-emerald-700
  swatch("#d97706", N.amber), // --p-amber-600
  swatch("#ca8a04", N.gold), // --p-gold-600
  swatch("#dc2626", N.red), // --p-red-600
  swatch("#0f172a", N.ink), // --p-ink-900
]);

/**
 * Pale enough to print type over, and pale enough to print at all.
 *
 * Nothing below about 92% lightness is offered: a mid-tone page costs a
 * cartridge of toner per class set and comes out of a school photocopier as
 * grey mud. The tints are the 50-step of each ramp, which is the lightest tone
 * the palette defines.
 */
const PAPERS: readonly Swatch[] = Object.freeze([
  swatch("#ffffff", N.paper), // --p-paper
  swatch("#fafaf7", N.paperWarm), // --p-studio-canvas
  swatch("#f1f5f9", N.mist), // --p-ink-100
  swatch("#eff6ff", N.blueTint), // --p-blue-50
  swatch("#ecfdf5", N.greenTint), // --p-emerald-50
  swatch("#fffbeb", N.amberTint), // --p-amber-50
  swatch("#fef2f2", N.redTint), // --p-red-50
]);

/**
 * Which set a token is offered from.
 *
 * A page background picking from the ink set would let a teacher print a black
 * sheet, and a heading picking from the paper set would let them print white on
 * white. Neither is a rule the schema can express — both are `HexColor` — so it
 * is expressed here, where the choosing happens.
 */
export const swatchesFor = (token: ColorToken): readonly Swatch[] => {
  switch (token) {
    case "accent":
      return ACCENTS;
    case "background":
    case "surface":
    case "accentSoft":
      return PAPERS;
    default:
      return INKS;
  }
};

/** The colours a page background may be: paper tints, and nothing darker. */
export const PAGE_SWATCHES = PAPERS;

/** Which theme colours the panel lets a teacher change, in the order shown. */
export const EDITABLE_COLOR_TOKENS: readonly ColorToken[] = Object.freeze([
  "accent",
  "text",
  "heading",
  "background",
  "surface",
  "rule",
]);

/**
 * The eight callout tokens are absent from the list above on purpose.
 *
 * `calloutSuccess` is green because it means "correct", and `calloutDanger` is
 * red because it means "careful". Letting those be recoloured is not a freedom,
 * it is a way to produce a paper whose green box means danger — and the pupil
 * reading it has no legend. They travel with the chosen theme instead.
 */

export type ColorOutcome =
  | { readonly ok: true; readonly hex: HexColor }
  | { readonly ok: false; readonly reason: "shape" | "banned" };

/**
 * A typed colour, judged.
 *
 * Two refusals rather than one boolean, because they need different sentences:
 * "#12" is a typo the teacher can fix by typing more, and "#6366f1" is a
 * correct colour this product will not use. Telling them apart is the whole
 * difference between a hint and a rule.
 */
export const judgeColor = (input: string): ColorOutcome => {
  const parsed = HexColor.safeParse(input.trim().toLowerCase());
  if (!parsed.success) return { ok: false, reason: "shape" };
  if (isForbiddenBrandHue(parsed.data)) return { ok: false, reason: "banned" };
  return { ok: true, hex: parsed.data };
};
