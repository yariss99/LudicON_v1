import type { TeacherId, Timestamp } from "@ludicon/domain";
import { DEFAULT_THEME } from "../theme/default-theme.js";
import type { Theme } from "../theme/theme.js";
import type { Block } from "./blocks.js";
import {
  BlockId,
  ColumnId,
  EvaluationProjectId,
  PageId,
  SectionId,
} from "./identifiers.js";
import { plainTextToInline } from "./inline.js";
import { PageSetup, type Page } from "./page.js";
import {
  EVALUATION_SCHEMA_VERSION,
  EvaluationMeta,
  type EvaluationProject,
} from "./project.js";
import { columnsForLayout, SectionStyle, type Section } from "./section.js";

/**
 * The empty document a teacher actually starts from.
 *
 * Not literally empty: an evaluation paper without a cover is not a shape any
 * Romanian school uses, and a teacher handed a blank canvas has to reconstruct
 * that shape before they can do the thing they came to do. Two pages — a cover
 * that permits free placement, and one body page ready for questions — is the
 * smallest structure that is recognisably a paper.
 *
 * `newId` is INJECTED rather than called from a global. `crypto.randomUUID` was
 * the rejected alternative: it is an ambient this package's `lib: ES2023` does
 * not declare, so using it would either force a `lib: DOM` this package must
 * not have, or an untyped global. Injecting it also makes the factory pure, so
 * a test can assert on an exact document instead of on a shape.
 */

export interface CreateEvaluationProjectInput {
  readonly ownerId: TeacherId;
  readonly createdAt: Timestamp;
  /** Must return a distinct, non-empty string on every call. */
  readonly newId: () => string;
  readonly meta?: Partial<EvaluationMeta>;
  readonly theme?: Theme;
  readonly pageSetup?: PageSetup;
}

export const createEvaluationProject = (
  input: CreateEvaluationProjectInput,
): EvaluationProject => {
  const meta = EvaluationMeta.parse(input.meta ?? {});
  const pageSetup = input.pageSetup ?? PageSetup.parse({});
  const style = SectionStyle.parse({});

  const blockId = (): BlockId => BlockId.parse(input.newId());
  const columnId = (): ColumnId => ColumnId.parse(input.newId());
  const sectionId = (): SectionId => SectionId.parse(input.newId());
  const pageId = (): PageId => PageId.parse(input.newId());

  /**
   * Seeded FROM the metadata, not bound TO it.
   *
   * A live binding would need the document to hold a formula, and every later
   * edit of the heading would have to decide whether it breaks the link. The
   * teacher owns the words on the page; the metadata is what the library lists
   * the paper under. `setMeta` deliberately does not reach in and rewrite this
   * heading.
   */
  const titleBlock: Block = {
    id: blockId(),
    kind: "heading",
    level: "h1",
    content: plainTextToInline(meta.title),
  };

  const descriptionBlock: Block = {
    id: blockId(),
    kind: "paragraph",
    content: plainTextToInline(meta.description),
  };

  const coverColumns = columnsForLayout("1", columnId);
  const coverColumn = coverColumns[0];
  if (!coverColumn) {
    throw new Error("Layout-ul de o coloană trebuie să producă o coloană.");
  }

  const coverSection: Section = {
    id: sectionId(),
    layout: "1",
    style,
    columns: [
      { ...coverColumn, blockOrder: [titleBlock.id, descriptionBlock.id] },
    ],
  };

  const bodySection: Section = {
    id: sectionId(),
    layout: "1",
    style,
    columns: columnsForLayout("1", columnId),
  };

  const coverPage: Page = {
    id: pageId(),
    sectionOrder: [coverSection.id],
    /** The one page where placing by eye is safe — see `./free-placement.ts`. */
    allowsFreePlacement: true,
    background: null,
    overrides: null,
  };

  const bodyPage: Page = {
    id: pageId(),
    sectionOrder: [bodySection.id],
    allowsFreePlacement: false,
    background: null,
    overrides: null,
  };

  return {
    id: EvaluationProjectId.parse(input.newId()),
    ownerId: input.ownerId,
    schemaVersion: EVALUATION_SCHEMA_VERSION,
    meta,
    theme: input.theme ?? DEFAULT_THEME,
    pageSetup,
    pageOrder: [coverPage.id, bodyPage.id],
    pages: {
      [coverPage.id]: coverPage,
      [bodyPage.id]: bodyPage,
    },
    sections: {
      [coverSection.id]: coverSection,
      [bodySection.id]: bodySection,
    },
    blocks: {
      [titleBlock.id]: titleBlock,
      [descriptionBlock.id]: descriptionBlock,
    },
    answerKey: {},
    archived: false,
    archivedAt: null,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };
};

/**
 * A body page with one full-width section, ready to receive blocks.
 *
 * Exported separately from the factory because `addPage` deliberately takes a
 * page rather than inventing one: a command that fabricated ids would not be
 * replayable, and every id in the document has to come from the same injected
 * source for undo to restore what it removed.
 */
export const createBlankPage = (
  newId: () => string,
): { readonly page: Page; readonly section: Section } => {
  const section: Section = {
    id: SectionId.parse(newId()),
    layout: "1",
    style: SectionStyle.parse({}),
    columns: columnsForLayout("1", () => ColumnId.parse(newId())),
  };

  const page: Page = {
    id: PageId.parse(newId()),
    sectionOrder: [section.id],
    allowsFreePlacement: false,
    background: null,
    overrides: null,
  };

  return { page, section };
};
