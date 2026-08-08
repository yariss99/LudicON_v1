import { z } from "zod";
import { Millimetres } from "../model/geometry.js";
import { SectionLayout } from "../model/section-layout.js";
import { ColorToken, HexColor } from "./color.js";

/**
 * The theme is a COMPLETE token set — no field has a default.
 *
 * That is the opposite of the rule everywhere else in this package, and it is
 * deliberate: a half-specified theme is not a design, it is a bug that shows up
 * as one heading in the wrong size on page four. If a stored theme is missing a
 * token, we want the parse to fail loudly rather than silently substitute a size
 * nobody chose. Blocks get defaults because a block genuinely means "whatever
 * the theme says"; the theme has nothing to defer to.
 */

export const TypographySlot = z.enum(["h1", "h2", "h3", "h4", "body", "small"]);
export type TypographySlot = z.infer<typeof TypographySlot>;

export const TypographyStep = z.object({
  sizePt: z.number().min(4).max(96),
  weight: z.number().int().min(100).max(900),
  lineHeight: z.number().min(0.8).max(3),
  letterSpacingEm: z.number().min(-0.1).max(0.5),
});
export type TypographyStep = z.infer<typeof TypographyStep>;

export const Typography = z.object({
  /** A CSS font stack. The app is responsible for actually loading it. */
  fontFamily: z.string().min(1).max(300),
  /**
   * EXHAUSTIVE on purpose. Zod 4 made `z.record` over an enum require every
   * member, and here that is exactly right — a theme that defines `h1` but not
   * `h3` cannot render a document. Contrast `ThemeSpacing.columnGapByLayout`
   * below, which is genuinely sparse and therefore uses `z.partialRecord`.
   */
  scale: z.record(TypographySlot, TypographyStep),
});
export type Typography = z.infer<typeof Typography>;

/** Every semantic token resolved to a literal hex. Exhaustive, as above. */
export const ThemeColors = z.record(ColorToken, HexColor);
export type ThemeColors = z.infer<typeof ThemeColors>;

export const ThemeSpacing = z.object({
  blockGapMm: Millimetres,
  sectionGapMm: Millimetres,
  columnGapMm: Millimetres,
  listIndentMm: Millimetres,
  paragraphSpacingMm: Millimetres,
  /**
   * Per-layout gutter overrides, and the reason this package cares about the
   * difference between `z.record` and `z.partialRecord`.
   *
   * Four columns on A4 need a tighter gutter than two, or the text measure
   * collapses. That is a real typographic adjustment for two or three layouts,
   * not all six — so the map is sparse, and Zod 4's enum-keyed `z.record` would
   * reject it for missing the other rows. `z.partialRecord` is the variant that
   * accepts partial data.
   */
  columnGapByLayout: z.partialRecord(SectionLayout, Millimetres),
});
export type ThemeSpacing = z.infer<typeof ThemeSpacing>;

export const ThemeBorders = z.object({
  hairlineMm: Millimetres,
  regularMm: Millimetres,
  thickMm: Millimetres,
  defaultColor: ColorToken,
});
export type ThemeBorders = z.infer<typeof ThemeBorders>;

export const ThemeRadius = z.object({
  noneMm: Millimetres,
  smallMm: Millimetres,
  mediumMm: Millimetres,
  largeMm: Millimetres,
});
export type ThemeRadius = z.infer<typeof ThemeRadius>;

export const ExerciseNumbering = z.enum(["arabic", "roman", "letters", "none"]);
export type ExerciseNumbering = z.infer<typeof ExerciseNumbering>;

/**
 * How exercises look before any of them says otherwise.
 *
 * These live on the theme rather than on each exercise definition because they
 * are a property of the PAPER, not of the question: numbering style and whether
 * points are printed must be consistent down a whole sheet, and a registry
 * entry has no way to know what the sheet around it decided.
 */
export const ExerciseDefaults = z.object({
  promptSlot: TypographySlot,
  numbering: ExerciseNumbering,
  showPoints: z.boolean(),
  /** Printed next to the points, e.g. "p." in "3 p." */
  pointsLabel: z.string().max(20),
  spacingAboveMm: Millimetres,
  spacingBelowMm: Millimetres,
  answerRuleColor: ColorToken,
  answerRuleWidthMm: Millimetres,
  answerLineGapMm: Millimetres,
});
export type ExerciseDefaults = z.infer<typeof ExerciseDefaults>;

export const Theme = z.object({
  id: z.string().min(1).max(80),
  /** Teacher-facing Romanian name, shown in the theme picker. */
  name: z.string().min(1).max(120),
  typography: Typography,
  colors: ThemeColors,
  spacing: ThemeSpacing,
  borders: ThemeBorders,
  radius: ThemeRadius,
  exerciseDefaults: ExerciseDefaults,
});
export type Theme = z.infer<typeof Theme>;

/** The gutter for one layout: its override if there is one, else the default. */
export const columnGapFor = (theme: Theme, layout: SectionLayout): number =>
  theme.spacing.columnGapByLayout[layout] ?? theme.spacing.columnGapMm;
