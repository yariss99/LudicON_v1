import { z } from "zod";
import { ColorValue } from "../theme/color.js";
import { EdgeInsets, Millimetres } from "./geometry.js";
import { BlockId, ColumnId, SectionId } from "./identifiers.js";
import {
  columnSpans,
  SECTION_GRID_UNITS,
  SectionLayout,
} from "./section-layout.js";

/**
 * A section is one horizontal band of the page; its columns are the only place
 * a block can sit in normal flow.
 *
 * Columns are stored INLINE, unlike pages, sections and blocks, which are
 * stored by id. That asymmetry is deliberate: a column has no identity outside
 * its section — you cannot move one to another section, and there is no UI
 * affordance that selects a column on its own. Promoting them to a top-level
 * record would add a fourth thing to keep in sync for no operation that needs
 * it. They still carry an id, because a block's parent has to be nameable.
 */

export const Column = z.object({
  id: ColumnId,
  /** Grid units out of `SECTION_GRID_UNITS`; must match the layout's row. */
  span: z.number().int().min(1).max(SECTION_GRID_UNITS),
  blockOrder: z.array(BlockId).default([]),
});
export type Column = z.infer<typeof Column>;

export const SectionBorder = z.object({
  widthMm: Millimetres.default(0.3),
  color: ColorValue.default("border"),
  /** Which edges are drawn. All four by default. */
  sides: z
    .object({
      top: z.boolean().default(true),
      right: z.boolean().default(true),
      bottom: z.boolean().default(true),
      left: z.boolean().default(true),
    })
    .prefault({}),
});
export type SectionBorder = z.infer<typeof SectionBorder>;

export const SectionStyle = z.object({
  padding: EdgeInsets.prefault({}),
  /** Gutter between this section's columns. */
  columnGapMm: Millimetres.default(6),
  /** Gap below this section, before the next one. */
  spacingBelowMm: Millimetres.default(6),
  background: ColorValue.nullable().default(null),
  border: SectionBorder.nullable().default(null),
  radiusMm: Millimetres.default(0),
  /**
   * Forces this section to start a new printed page.
   *
   * Pagination is otherwise the app's job — it needs measured heights, which
   * need a DOM. This one flag is the teacher's explicit instruction, so it
   * belongs in the document rather than in whatever measured it.
   */
  breakBefore: z.boolean().default(false),
});
export type SectionStyle = z.infer<typeof SectionStyle>;

export const Section = z.object({
  id: SectionId,
  layout: SectionLayout.default("1"),
  style: SectionStyle.prefault({}),
  columns: z.array(Column).default([]),
});
export type Section = z.infer<typeof Section>;

/**
 * Builds the columns a layout calls for.
 *
 * `newId` is injected rather than generated here so the factory stays pure and
 * a test can assert on exact ids. `crypto.randomUUID` was the rejected
 * alternative: it is an ambient global this package's `lib: ES2023` does not
 * declare, and reaching for it would make every call non-deterministic.
 */
export const columnsForLayout = (
  layout: SectionLayout,
  newId: () => ColumnId,
): Column[] =>
  columnSpans(layout).map((span) => ({
    id: newId(),
    span,
    blockOrder: [],
  }));

/**
 * Whether a section's columns still agree with its layout.
 *
 * They can disagree only if something wrote `layout` without rebuilding
 * `columns`, which is why changing a layout must go through a command rather
 * than a field write.
 */
export const columnsMatchLayout = (section: Section): boolean => {
  const spans = columnSpans(section.layout);
  return (
    spans.length === section.columns.length &&
    section.columns.every((column, index) => column.span === spans[index])
  );
};

export const findColumn = (
  section: Section,
  columnId: ColumnId,
): Column | undefined =>
  section.columns.find((column) => column.id === columnId);

export const sectionBlockIds = (section: Section): readonly BlockId[] =>
  section.columns.flatMap((column) => column.blockOrder);
