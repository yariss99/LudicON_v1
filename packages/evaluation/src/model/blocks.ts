import { z } from "zod";
import { BlockStyleOverride } from "../theme/style.js";
import { FreePlacement, Millimetres } from "./geometry.js";
import { BlockId } from "./identifiers.js";
import { InlineContent, isEmptyInline } from "./inline.js";

/**
 * The block union, discriminated on `kind`.
 *
 * Three families live in one union rather than three parallel types:
 *
 *  - element blocks are the printed furniture (headings, images, rules);
 *  - `exercise` is a question, and it is DELIBERATELY OPAQUE — it carries a
 *    type name and an unknown config, and the registry in `../exercises` owns
 *    the shape. The rejected alternative was one union member per exercise type
 *    (`multipleChoice`, `fillInTheBlank`, ...), which would mean this package —
 *    the document model — changing every time a colleague adds a question type,
 *    and the printed paper's schema version bumping with it;
 *  - `free` is a positioned frame, and it is the only container besides a
 *    column.
 *
 * Every member carries `id` and an optional `style`. `style` is absent by
 * default and that is the point: absent means "the theme decides", so
 * re-theming a paper actually changes it.
 */

export const BlockKind = z.enum([
  "heading",
  "paragraph",
  "list",
  "quote",
  "image",
  "divider",
  "spacer",
  "table",
  "callout",
  "answerSpace",
  "exercise",
  "free",
]);
export type BlockKind = z.infer<typeof BlockKind>;

export const BLOCK_KIND_LABEL: Readonly<Record<BlockKind, string>> =
  Object.freeze({
    heading: "Titlu",
    paragraph: "Paragraf",
    list: "Listă",
    quote: "Citat",
    image: "Imagine",
    divider: "Linie",
    spacer: "Spațiu",
    table: "Tabel",
    callout: "Casetă",
    answerSpace: "Spațiu de răspuns",
    exercise: "Exercițiu",
    free: "Element liber",
  });

export const HeadingLevel = z.enum(["h1", "h2", "h3", "h4"]);
export type HeadingLevel = z.infer<typeof HeadingLevel>;

export const ListStyle = z.enum(["bullet", "numbered", "lettered", "none"]);
export type ListStyle = z.infer<typeof ListStyle>;

export const DividerStyle = z.enum(["solid", "dashed", "dotted"]);
export type DividerStyle = z.infer<typeof DividerStyle>;

export const CalloutTone = z.enum([
  "info",
  "success",
  "warning",
  "danger",
  "neutral",
]);
export type CalloutTone = z.infer<typeof CalloutTone>;

/**
 * How the pupil is invited to write.
 *
 * `lines` is ruled writing lines, `grid` is squared paper for maths, `box` is a
 * bordered empty area, `blank` is nothing at all — reserved white space, which
 * a printed paper needs and a screen does not.
 */
export const AnswerSpaceStyle = z.enum(["lines", "grid", "box", "blank"]);
export type AnswerSpaceStyle = z.infer<typeof AnswerSpaceStyle>;

export const ImageFit = z.enum(["contain", "cover"]);
export type ImageFit = z.infer<typeof ImageFit>;

export const HorizontalAlign = z.enum(["left", "center", "right"]);
export type HorizontalAlign = z.infer<typeof HorizontalAlign>;

/** Spread into every member. Kept as a plain object so `z.object` can absorb it. */
const blockCore = {
  id: BlockId,
  style: BlockStyleOverride.optional(),
};

export const HeadingBlock = z.object({
  ...blockCore,
  kind: z.literal("heading"),
  level: HeadingLevel.default("h2"),
  content: InlineContent.default([]),
});
export type HeadingBlock = z.infer<typeof HeadingBlock>;

export const ParagraphBlock = z.object({
  ...blockCore,
  kind: z.literal("paragraph"),
  content: InlineContent.default([]),
});
export type ParagraphBlock = z.infer<typeof ParagraphBlock>;

export const ListBlock = z.object({
  ...blockCore,
  kind: z.literal("list"),
  listStyle: ListStyle.default("bullet"),
  /** One entry per item. Nested lists are not modelled — see `inline.ts`. */
  items: z.array(InlineContent).default([]),
  startAt: z.number().int().min(1).default(1),
});
export type ListBlock = z.infer<typeof ListBlock>;

export const QuoteBlock = z.object({
  ...blockCore,
  kind: z.literal("quote"),
  content: InlineContent.default([]),
  attribution: z.string().max(200).default(""),
});
export type QuoteBlock = z.infer<typeof QuoteBlock>;

/**
 * `src` is an opaque string, not a URL schema.
 *
 * It may be an https URL, a data URI pasted by the teacher, or a
 * `@ludicon/data-access` asset key. Constraining it here would force this
 * package to know how the app stores files, which is precisely the coupling it
 * exists to avoid.
 */
export const ImageBlock = z.object({
  ...blockCore,
  kind: z.literal("image"),
  src: z.string().max(4000).default(""),
  /** Required by accessibility and by the print pipeline's fallback text. */
  alt: z.string().max(500).default(""),
  caption: InlineContent.default([]),
  widthMm: Millimetres.nullable().default(null),
  heightMm: Millimetres.nullable().default(null),
  fit: ImageFit.default("contain"),
  align: HorizontalAlign.default("center"),
});
export type ImageBlock = z.infer<typeof ImageBlock>;

export const DividerBlock = z.object({
  ...blockCore,
  kind: z.literal("divider"),
  dividerStyle: DividerStyle.default("solid"),
  thicknessMm: Millimetres.default(0.3),
});
export type DividerBlock = z.infer<typeof DividerBlock>;

/**
 * Deliberate empty space.
 *
 * Not the same as an empty paragraph: a spacer survives re-theming at exactly
 * the height the teacher set, which is what someone lining up a signature line
 * on a printed page actually wants.
 */
export const SpacerBlock = z.object({
  ...blockCore,
  kind: z.literal("spacer"),
  heightMm: Millimetres.default(8),
});
export type SpacerBlock = z.infer<typeof SpacerBlock>;

export const TableCell = z.object({
  content: InlineContent.default([]),
  colSpan: z.number().int().min(1).max(12).default(1),
  rowSpan: z.number().int().min(1).max(50).default(1),
});
export type TableCell = z.infer<typeof TableCell>;

export const TableRow = z.object({
  cells: z.array(TableCell).default([]),
});
export type TableRow = z.infer<typeof TableRow>;

export const TableBlock = z.object({
  ...blockCore,
  kind: z.literal("table"),
  headerRow: z.boolean().default(true),
  rows: z.array(TableRow).default([]),
  /** Fractions of the table width. Empty means equal columns. */
  columnWidths: z.array(z.number().min(0).max(1)).default([]),
  bordered: z.boolean().default(true),
});
export type TableBlock = z.infer<typeof TableBlock>;

export const CalloutBlock = z.object({
  ...blockCore,
  kind: z.literal("callout"),
  tone: CalloutTone.default("info"),
  title: z.string().max(200).default(""),
  content: InlineContent.default([]),
});
export type CalloutBlock = z.infer<typeof CalloutBlock>;

export const AnswerSpaceBlock = z.object({
  ...blockCore,
  kind: z.literal("answerSpace"),
  answerStyle: AnswerSpaceStyle.default("lines"),
  /** Used by `lines` and `grid`; ignored by `box` and `blank`, which use height. */
  lines: z.number().int().min(0).max(60).default(3),
  lineGapMm: Millimetres.default(9),
  heightMm: Millimetres.nullable().default(null),
});
export type AnswerSpaceBlock = z.infer<typeof AnswerSpaceBlock>;

/**
 * A question.
 *
 * `config` is `unknown` and stays that way inside this package. The registry
 * entry for `exerciseType` owns its schema, validates it, and scores it; the
 * document model only knows that a question exists, where it sits and what it
 * is worth. That is what lets a new exercise type ship without touching the
 * document schema or its version number.
 *
 * `points` is duplicated onto the block rather than read from the answer key
 * because the printed paper shows the points to the pupil and the answer key is
 * a separate sheet the pupil never sees. `validateProject` is what keeps the two
 * honest.
 */
export const ExerciseBlock = z.object({
  ...blockCore,
  kind: z.literal("exercise"),
  exerciseType: z.string().min(1).max(80),
  config: z.unknown(),
  /** The instruction printed above the exercise body ("Încercuiește..."). */
  prompt: InlineContent.default([]),
  points: z.number().min(0).max(100).default(1),
  /** Which of the definition's `layouts` to use. `null` means the first one. */
  layoutId: z.string().max(80).nullable().default(null),
});
export type ExerciseBlock = z.infer<typeof ExerciseBlock>;

/**
 * A frame placed at absolute page coordinates.
 *
 * It holds its children BY ID, exactly as a column does, so the document stays
 * normalised: a frame is simply a column that happens to know where it is. The
 * rejected alternative was nesting whole block values inside the frame, which
 * would have made a frame's children invisible to `doc.blocks`, given selection
 * two code paths, and turned every undo diff for a frame into a diff of its
 * entire subtree.
 *
 * A frame is only legal on a page with `allowsFreePlacement` — see
 * `./free-placement.ts`, which owns that rule and the validator for it.
 */
export const FreeBlock = z.object({
  ...blockCore,
  kind: z.literal("free"),
  placement: FreePlacement,
  blockOrder: z.array(BlockId).default([]),
});
export type FreeBlock = z.infer<typeof FreeBlock>;

export const Block = z.discriminatedUnion("kind", [
  HeadingBlock,
  ParagraphBlock,
  ListBlock,
  QuoteBlock,
  ImageBlock,
  DividerBlock,
  SpacerBlock,
  TableBlock,
  CalloutBlock,
  AnswerSpaceBlock,
  ExerciseBlock,
  FreeBlock,
]);
export type Block = z.infer<typeof Block>;

export const isExerciseBlock = (block: Block): block is ExerciseBlock =>
  block.kind === "exercise";

/**
 * The type guard the free-placement rule is enforced through. Exported from the
 * block module (not the rule module) because narrowing a `Block` is a fact
 * about blocks; whether that block is *allowed* is a fact about pages.
 */
export const isFreeBlock = (block: Block): block is FreeBlock =>
  block.kind === "free";

/** Blocks that own other blocks. Today that is only the free frame. */
export const isContainerBlock = (block: Block): block is FreeBlock =>
  isFreeBlock(block);

export const childBlockIds = (block: Block): readonly BlockId[] =>
  isContainerBlock(block) ? block.blockOrder : [];

/**
 * Whether a block would print nothing a pupil could read.
 *
 * Structural blocks (divider, spacer, answer space) count as empty: a paper
 * containing only ruled lines and a horizontal rule is an empty paper, and
 * `validateProject` should say so rather than congratulate the teacher on it.
 * An exercise is never empty — it is the point of the document.
 */
export const isBlockEmpty = (block: Block): boolean => {
  switch (block.kind) {
    case "heading":
    case "paragraph":
    case "quote":
      return isEmptyInline(block.content);
    case "callout":
      return block.title.trim() === "" && isEmptyInline(block.content);
    case "list":
      return block.items.every((item) => isEmptyInline(item));
    case "table":
      return block.rows.every((row) =>
        row.cells.every((cell) => isEmptyInline(cell.content)),
      );
    case "image":
      return block.src.trim() === "";
    case "divider":
    case "spacer":
    case "answerSpace":
      return true;
    case "exercise":
      return false;
    // A frame is as empty as what it holds; the caller resolves the children.
    case "free":
      return block.blockOrder.length === 0;
  }
};
