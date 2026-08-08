import { useMemo, type ReactNode } from "react";
import {
  BLOCK_KIND_LABEL,
  SECTION_LAYOUT_ORDER,
  SectionLayout,
  type Section,
} from "@ludicon/evaluation";
import { Label, ScrollArea, ToggleGroup, ToggleGroupItem } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { relaidSection } from "../block-factory";
import { replaceSection } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { resolveSelection } from "../editor-store";
import { BlockInspector } from "./block-inspector";
import { LAYOUT_LABEL, LayoutMark } from "./layout-mark";
import { PageInspector } from "./page-inspector";
import { ThemeInspector } from "./theme-inspector";

/**
 * What is selected, and what can be changed about it.
 *
 * One panel for all three kinds of selection rather than three panels that
 * appear and disappear: the region is always in the same place, so a teacher
 * who has just clicked something knows where to look, and the empty state is a
 * sentence telling them how to fill it rather than a blank column.
 *
 * Changing a row's layout goes through `relaidSection`, which rebuilds the
 * columns AND carries the blocks across in one command. Two commands — set the
 * layout, then move the blocks — would leave a frame in between where
 * `columnsMatchLayout` is false, and would need two presses of undo to reverse
 * something the teacher did once.
 *
 * ## The name of what is selected is a title bar, not a paragraph
 *
 * It was a `<p>` inside the scroller, in the same 14px semibold as the panel's
 * own heading and the library's group headings — three ranks painted as one,
 * with the 16px controls beneath outweighing all of them. Now it is the panel's
 * heading, it is the only thing at that weight, and it stays put while the
 * fields scroll. Which piece you are editing is the one fact this region exists
 * to state; it should not be able to scroll off the top of it.
 *
 * The frame is assembled here for all four cases rather than by each case, so
 * `BlockInspector` returns fields and nothing else. The alternative — every
 * branch drawing its own header — is how the heading over a selected row ends
 * up a different size from the heading over a selected piece.
 */

export function InspectorPanel() {
  const document = useEditor((state) => state.document);
  const selection = useEditor((state) => state.selection);

  const resolved = useMemo(
    () => resolveSelection(document, selection),
    [document, selection],
  );

  if (!resolved) {
    /**
     * Nothing chosen is not nothing to show: it is the whole paper.
     *
     * This used to be one sentence — "Alege ceva de pe pagină" — in a panel
     * four hundred pixels tall, which is a region announcing that it has no
     * reason to exist yet. The theme is precisely the setting that applies when
     * no single piece is selected, so it is what fills the space, and the
     * teaching sentence survives at the top of it where it still does its job.
     *
     * The rejected alternative was a fourth tab or a dialog for the theme. Both
     * make "how does this paper look" a place you go rather than a thing that
     * is already open, and both put the controls somewhere the sheet is not
     * visible beside them — which for a colour and a type size is the only
     * thing that makes the choice possible.
     */
    return (
      <Shell title={EVALUATION_COPY.themeTitle}>
        <ThemeInspector />
      </Shell>
    );
  }

  if (resolved.kind === "block") {
    const block = document.blocks[resolved.id];
    if (!block) return null;
    return (
      <Shell
        title={EVALUATION_COPY.selectedPiece(BLOCK_KIND_LABEL[block.kind])}
      >
        <BlockInspector block={block} />
      </Shell>
    );
  }

  if (resolved.kind === "section") {
    const section = document.sections[resolved.id];
    if (!section) return null;
    return (
      <Shell title={EVALUATION_COPY.selectedRow}>
        <RowFields section={section} />
      </Shell>
    );
  }

  const page = document.pages[resolved.id];
  if (!page) return null;

  /**
   * The sheet is named by its position, not by the word "Pagină".
   *
   * Margins, headers and numbering are still document-wide and still belong to
   * a settings surface that does not exist. What a page genuinely owns is what
   * is behind its text and whether pieces may be placed on it by eye, and both
   * of those are per-sheet by design — a cover has a crest and a body page does
   * not. See `PageInspector`.
   */
  const index = document.pageOrder.indexOf(resolved.id) + 1;
  return (
    <Shell
      title={
        index === 1
          ? EVALUATION_COPY.pageCover
          : EVALUATION_COPY.pageNumbered(index)
      }
    >
      {/* Keyed on the sheet, so the "which kind of background" choice this
          panel keeps locally resets when the teacher moves to another one.
          See the note in `page-inspector.tsx`. */}
      <PageInspector key={page.id} page={page} />
    </Shell>
  );
}

/** The title bar that stays, and the scroller under it. */
function Shell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="shrink-0 truncate border-b border-border px-4 py-3 text-base font-semibold text-panel-foreground">
        {title}
      </h2>
      <ScrollArea className="min-h-0 flex-1">{children}</ScrollArea>
    </div>
  );
}

function RowFields({ section }: { section: Section }) {
  const store = useEditorStore();

  return (
    <div className="flex flex-col gap-1.5 px-4 py-4">
      <Label>{EVALUATION_COPY.fieldRowLayout}</Label>
      {/**
       * Six marks in one row, where six names took three.
       *
       * The names are five words long and two of them differ only in word
       * order, so as labels they neither fit the rail nor separate from each
       * other. The shapes fit — six 44px targets are 264px inside a 311px rail
       * — and each one is the answer drawn. The words are still what a screen
       * reader hears, and the library one panel up teaches the pairing.
       */}
      <ToggleGroup
        type="single"
        value={section.layout}
        onValueChange={(value) => {
          const parsed = SectionLayout.safeParse(value);
          if (parsed.success) {
            replaceSection(store, relaidSection(section, parsed.data));
          }
        }}
      >
        {SECTION_LAYOUT_ORDER.map((layout) => (
          <ToggleGroupItem
            key={layout}
            value={layout}
            aria-label={LAYOUT_LABEL[layout]}
            className="px-0"
          >
            <LayoutMark layout={layout} />
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
