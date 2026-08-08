import { z } from "zod";

/**
 * A colour in this document is EITHER a semantic token OR a literal hex the
 * teacher picked. Never a raw CSS colour name, never `rgb()`, never a Tailwind
 * class.
 *
 * The token is the interesting half: a block that says `"accent"` follows the
 * theme, so re-theming a whole paper is one field write. A block that says
 * `"#2563eb"` has opted out permanently, which is a legitimate thing for a
 * teacher to want and a terrible default. Storing only hex — the rejected
 * alternative — would have made "change the theme" mean rewriting every block.
 *
 * `resolveColor` in `./resolve.ts` collapses both halves to a hex at render
 * time, so no consumer ever has to know which kind it got.
 */

export const ColorToken = z.enum([
  "text",
  "textMuted",
  "heading",
  "background",
  "surface",
  "accent",
  "accentSoft",
  "border",
  "borderStrong",
  "rule",
  "calloutInfo",
  "calloutInfoText",
  "calloutSuccess",
  "calloutSuccessText",
  "calloutWarning",
  "calloutWarningText",
  "calloutDanger",
  "calloutDangerText",
]);
export type ColorToken = z.infer<typeof ColorToken>;

/**
 * Six-digit hex only. Three-digit shorthand and eight-digit alpha are rejected
 * so that every stored colour has exactly one spelling — two spellings of the
 * same colour make equality checks (and therefore undo diffs) lie.
 */
export const HexColor = z
  .string()
  .regex(/^#[0-9a-fA-F]{6}$/, "Culoarea trebuie scrisă ca #rrggbb.");
export type HexColor = z.infer<typeof HexColor>;

export const ColorValue = z.union([ColorToken, HexColor]);
export type ColorValue = z.infer<typeof ColorValue>;

export const isColorToken = (value: ColorValue): value is ColorToken =>
  ColorToken.safeParse(value).success;

/**
 * The HSL hue of a hex colour, in degrees. Returns 0 for greys, which have no
 * meaningful hue — callers that care must check saturation themselves.
 */
export const hueOf = (hex: HexColor): number => {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const delta = max - min;
  if (delta === 0) return 0;

  const sector =
    max === red
      ? ((green - blue) / delta) % 6
      : max === green
        ? (blue - red) / delta + 2
        : (red - green) / delta + 4;

  return (sector * 60 + 360) % 360;
};

export const saturationOf = (hex: HexColor): number => {
  const red = Number.parseInt(hex.slice(1, 3), 16) / 255;
  const green = Number.parseInt(hex.slice(3, 5), 16) / 255;
  const blue = Number.parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(red, green, blue);
  const min = Math.min(red, green, blue);
  const lightness = (max + min) / 2;
  if (max === min) return 0;

  return lightness > 0.5
    ? (max - min) / (2 - max - min)
    : (max - min) / (max + min);
};

/**
 * The forbidden band.
 *
 * Design Book CH01 §12.2 states five separate times that purple, indigo and
 * violet are not this product's colours — the "AI = purple glow" convention is
 * explicitly rejected. That is a product rule, so it is modelled here rather
 * than left to whoever is picking swatches in a component.
 *
 * The band is 232°-310°, and both ends were measured rather than guessed:
 *
 *   --p-blue-700  #1d4ed8  224°  the product's deepest blue — must pass
 *   indigo-400    #818cf8  235°  must fail
 *   indigo-500    #6366f1  239°  must fail
 *   violet-600    #7c3aed  263°  must fail
 *   --p-red-500   #ef4444    0°  must pass
 *   rose-500      #f43f5e  350°  must pass
 *
 * 232° is the midpoint of the only genuinely narrow gap, between deep blue and
 * indigo — they are adjacent hues, so no threshold separates every tint of one
 * from every tint of the other. Pale indigos below 232° (indigo-300 at 230°)
 * are let through knowingly: at that lightness they read as periwinkle, not as
 * the purple "AI" branding the rule exists to keep out.
 *
 * The saturation floor keeps the dark navy inks — technically blue-hued greys —
 * out of the net.
 */
export const FORBIDDEN_HUE_RANGE = Object.freeze({ from: 232, to: 310 });
const FORBIDDEN_SATURATION_FLOOR = 0.15;

export const isForbiddenBrandHue = (hex: HexColor): boolean => {
  if (saturationOf(hex) < FORBIDDEN_SATURATION_FLOOR) return false;
  const hue = hueOf(hex);
  return hue >= FORBIDDEN_HUE_RANGE.from && hue < FORBIDDEN_HUE_RANGE.to;
};

/**
 * Every hex in a colour map that breaks the rule above.
 *
 * Exported so the theme editor can grey out the swatch before the teacher
 * commits, rather than the model rejecting it afterwards. It is deliberately
 * NOT run at import time on `DEFAULT_THEME`: a package that throws while being
 * loaded is a package that cannot be debugged.
 */
export const forbiddenHues = (
  colors: Readonly<Record<string, HexColor>>,
): readonly HexColor[] =>
  Object.values(colors).filter((hex) => isForbiddenBrandHue(hex));
