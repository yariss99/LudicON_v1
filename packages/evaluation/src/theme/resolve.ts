import type { Block, CalloutTone } from "../model/blocks.js";
import { uniformInsets } from "../model/geometry.js";
import type { ColorToken, ColorValue, HexColor } from "./color.js";
import { isColorToken } from "./color.js";
import type { BlockStyle } from "./style.js";
import { layerBlockStyle } from "./style.js";
import type { Theme, TypographySlot } from "./theme.js";

/**
 * One function turns a theme plus a block into the numbers a renderer needs.
 *
 * The layering is theme -> kind -> block, and it only ever goes that way. The
 * rejected alternative was for each renderer to read the theme itself and apply
 * its own defaults: the canvas, the print pipeline and the PDF worker would then
 * each hold a private opinion about how far below a heading a paragraph sits,
 * and the paper on screen would stop matching the paper in the printer. Here
 * they all ask this function and get the same answer.
 *
 * It is deliberately not memoised. Memoising would need a cache keyed on a
 * theme and a block, both of which are replaced wholesale on every edit, so the
 * cache would miss every time and hold garbage between edits.
 */

const CALLOUT_TOKENS: Readonly<
  Record<CalloutTone, { background: ColorToken; text: ColorToken }>
> = Object.freeze({
  info: { background: "calloutInfo", text: "calloutInfoText" },
  success: { background: "calloutSuccess", text: "calloutSuccessText" },
  warning: { background: "calloutWarning", text: "calloutWarningText" },
  danger: { background: "calloutDanger", text: "calloutDangerText" },
  neutral: { background: "surface", text: "text" },
});

/** Which step of the type scale a block is set in. */
export const typographySlotForBlock = (
  theme: Theme,
  block: Block,
): TypographySlot => {
  switch (block.kind) {
    case "heading":
      return block.level;
    case "exercise":
      return theme.exerciseDefaults.promptSlot;
    case "image":
    case "table":
      return "small";
    default:
      return "body";
  }
};

/**
 * Collapses a stored colour to a literal hex.
 *
 * A token resolves through the theme; a hex the teacher picked passes through
 * untouched. Every renderer calls this, so no renderer has to know which of the
 * two it was handed.
 */
export const resolveColor = (theme: Theme, value: ColorValue): HexColor =>
  isColorToken(value) ? theme.colors[value] : value;

const kindLayer = (theme: Theme, block: Block): Partial<BlockStyle> => {
  switch (block.kind) {
    case "heading":
      return {
        color: "heading",
        marginTopMm: theme.spacing.sectionGapMm,
        marginBottomMm: theme.spacing.paragraphSpacingMm,
      };
    case "paragraph":
      return { marginBottomMm: theme.spacing.paragraphSpacingMm };
    case "list":
      return {
        padding: { ...uniformInsets(0), left: theme.spacing.listIndentMm },
      };
    case "quote":
      return {
        color: "textMuted",
        borderWidthMm: theme.borders.thickMm,
        borderColor: theme.borders.defaultColor,
        padding: { ...uniformInsets(0), left: theme.spacing.listIndentMm },
      };
    case "callout": {
      const tokens = CALLOUT_TOKENS[block.tone];
      return {
        color: tokens.text,
        background: tokens.background,
        padding: uniformInsets(theme.spacing.blockGapMm),
        radiusMm: theme.radius.mediumMm,
        borderWidthMm: theme.borders.hairlineMm,
        borderColor: tokens.text,
      };
    }
    case "table":
      return {
        borderWidthMm: block.bordered ? theme.borders.regularMm : 0,
        borderColor: theme.borders.defaultColor,
      };
    case "divider":
      return {
        borderWidthMm: block.thicknessMm,
        borderColor: theme.borders.defaultColor,
        marginTopMm: theme.spacing.blockGapMm,
        marginBottomMm: theme.spacing.blockGapMm,
      };
    case "answerSpace":
      return {
        borderWidthMm: theme.exerciseDefaults.answerRuleWidthMm,
        borderColor: theme.exerciseDefaults.answerRuleColor,
        marginTopMm: theme.spacing.blockGapMm,
        marginBottomMm: theme.spacing.blockGapMm,
      };
    case "exercise":
      return {
        marginTopMm: theme.exerciseDefaults.spacingAboveMm,
        marginBottomMm: theme.exerciseDefaults.spacingBelowMm,
      };
    case "image":
      return {
        align:
          block.align === "left"
            ? "left"
            : block.align === "right"
              ? "right"
              : "center",
      };
    case "spacer":
    case "free":
      return { marginTopMm: 0, marginBottomMm: 0 };
  }
};

/**
 * The computed style for one block: the theme's answer, adjusted for the block
 * kind, then overridden by whatever the teacher changed on this block.
 */
export const resolveBlockStyle = (theme: Theme, block: Block): BlockStyle => {
  const step = theme.typography.scale[typographySlotForBlock(theme, block)];

  const themeLayer: BlockStyle = {
    color: "text",
    background: null,
    fontSizePt: step.sizePt,
    fontWeight: step.weight,
    lineHeight: step.lineHeight,
    letterSpacingEm: step.letterSpacingEm,
    align: "left",
    padding: uniformInsets(0),
    marginTopMm: theme.spacing.blockGapMm,
    marginBottomMm: theme.spacing.blockGapMm,
    borderWidthMm: 0,
    borderColor: null,
    radiusMm: theme.radius.noneMm,
  };

  return layerBlockStyle(
    layerBlockStyle(themeLayer, kindLayer(theme, block)),
    block.style,
  );
};

/** The same style with every colour already collapsed to a hex. */
export type PaintedBlockStyle = Omit<
  BlockStyle,
  "color" | "background" | "borderColor"
> & {
  readonly color: HexColor;
  readonly background: HexColor | null;
  readonly borderColor: HexColor | null;
};

export const paintBlockStyle = (
  theme: Theme,
  style: BlockStyle,
): PaintedBlockStyle => ({
  ...style,
  color: resolveColor(theme, style.color),
  background:
    style.background === null ? null : resolveColor(theme, style.background),
  borderColor:
    style.borderColor === null ? null : resolveColor(theme, style.borderColor),
});
