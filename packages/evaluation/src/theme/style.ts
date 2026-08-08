import { z } from "zod";
import { EdgeInsets, Millimetres } from "../model/geometry.js";
import { ColorValue } from "./color.js";

/**
 * `BlockStyle` is the FULLY RESOLVED style — every field present, nothing to
 * fall back to. `BlockStyleOverride` is the same shape made partial, and that
 * is what a block actually stores.
 *
 * Two schemas rather than one because they answer different questions. A
 * renderer asks "what colour is this heading?" and must get an answer, so it
 * reads a resolved style. The document asks "what did the teacher change?" and
 * must distinguish "18pt because the theme says so" from "18pt because the
 * teacher typed it" — otherwise re-theming would silently keep the old sizes.
 * A single schema with defaults cannot tell those apart once parsed.
 *
 * `resolveBlockStyle` in `./resolve.ts` is the only thing that turns the second
 * into the first.
 */

export const TextAlign = z.enum(["left", "center", "right", "justify"]);
export type TextAlign = z.infer<typeof TextAlign>;

/**
 * Font size is in POINTS, not millimetres and not pixels.
 *
 * Points are what typography and print drivers speak, and every teacher who has
 * used Word knows what 12pt looks like. Geometry stays in mm; type stays in pt.
 * Mixing them into one unit would make one of the two audiences do arithmetic.
 */
export const BlockStyle = z.object({
  color: ColorValue,
  background: ColorValue.nullable(),
  fontSizePt: z.number().min(4).max(96),
  fontWeight: z.number().int().min(100).max(900),
  /** Unitless multiple of the font size, as CSS and InDesign both use. */
  lineHeight: z.number().min(0.8).max(3),
  /** In em, so it scales with the font size instead of fighting it. */
  letterSpacingEm: z.number().min(-0.1).max(0.5),
  align: TextAlign,
  padding: EdgeInsets,
  marginTopMm: Millimetres,
  marginBottomMm: Millimetres,
  borderWidthMm: Millimetres,
  borderColor: ColorValue.nullable(),
  radiusMm: Millimetres,
});
export type BlockStyle = z.infer<typeof BlockStyle>;

/** What a block stores: only the fields the teacher actually overrode. */
export const BlockStyleOverride = BlockStyle.partial();
export type BlockStyleOverride = z.infer<typeof BlockStyleOverride>;

/**
 * Layers an override onto a resolved style without letting an explicit
 * `undefined` erase a value.
 *
 * The rejected alternative was `{ ...base, ...override }`. That works for
 * parsed data, where absent keys really are absent, but any hand-built override
 * with `{ fontSizePt: undefined }` — which is what a form produces when a field
 * is cleared — would wipe the field to `undefined` and violate the schema.
 */
export const layerBlockStyle = (
  base: BlockStyle,
  override: BlockStyleOverride | undefined,
): BlockStyle => {
  if (!override) return base;
  return {
    color: override.color ?? base.color,
    background:
      override.background === undefined ? base.background : override.background,
    fontSizePt: override.fontSizePt ?? base.fontSizePt,
    fontWeight: override.fontWeight ?? base.fontWeight,
    lineHeight: override.lineHeight ?? base.lineHeight,
    letterSpacingEm: override.letterSpacingEm ?? base.letterSpacingEm,
    align: override.align ?? base.align,
    padding: override.padding ?? base.padding,
    marginTopMm: override.marginTopMm ?? base.marginTopMm,
    marginBottomMm: override.marginBottomMm ?? base.marginBottomMm,
    borderWidthMm: override.borderWidthMm ?? base.borderWidthMm,
    borderColor:
      override.borderColor === undefined
        ? base.borderColor
        : override.borderColor,
    radiusMm: override.radiusMm ?? base.radiusMm,
  };
};
