import { useMemo, useState } from "react";
import {
  ArrowLeftRight,
  BookOpen,
  Calculator,
  Eye,
  Feather,
  Heading,
  Image,
  Lightbulb,
  List,
  ListOrdered,
  Minus,
  MoveVertical,
  PenLine,
  Pilcrow,
  Quote,
  SpellCheck,
  StickyNote,
  Table,
  Type,
  type LucideIcon,
} from "lucide-react";
import {
  SECTION_LAYOUT_ORDER,
  type ExerciseCategory,
  type SectionLayout,
} from "@ludicon/evaluation";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  ScrollArea,
} from "@ludicon/ui";

import type { PieceKind } from "../block-factory";
import { useLibraryDrag } from "../canvas/canvas-dnd";
import { EVALUATION_COPY } from "../copy";
import { addPiece, addRow } from "../document-actions";
import { useEditorStore } from "../editor-context";
import { addExercise } from "../exercises/exercise-actions";
import { EXERCISE_REGISTRY } from "../exercises/registry";
import { LAYOUT_LABEL, LayoutMark } from "./layout-mark";

/**
 * What the teacher can put on the page.
 *
 * Buttons that can also be dragged — buttons FIRST, and that order is the rule
 * rather than a description of how it was built. A press adds the piece where
 * the teacher left off, exactly as it always has, and is the only route the
 * keyboard needs; a drag is a second way to invoke the same `addBlock` command
 * with the teacher choosing the seam themselves. Nothing about the drag route
 * is required to add a piece, which is what keeps this panel usable without a
 * pointer.
 *
 * The two coexist because dnd-kit's pointer sensor only claims a press once it
 * has travelled six pixels — see `activationConstraint` in
 * `../canvas/canvas-dnd.tsx`. Under that distance the press is never a drag and
 * the `onClick` below fires untouched.
 *
 * `attributes` from `useDraggable` are deliberately not spread onto these
 * buttons, and the `KeyboardSensor` is deliberately not registered. Both are
 * argued in `../canvas/canvas-dnd.tsx`; the short version is that the arrows,
 * Enter and Space already belong to the paper's roving tabindex, and a second
 * claimant would take them from it.
 *
 * Grouped and collapsible so the whole inventory is not a wall: rows first,
 * because a piece needs somewhere to land, then the two families of piece.
 *
 * ## Exercises are a list, and the list is searched
 *
 * The other two groups are fixed inventories of six and four; exercises are a
 * registry that grows, and fourteen full-width Romanian names is already past
 * what anyone scans. So that group leads with a search box, and the search runs
 * over the name, the description, the words teachers actually type — including
 * the diacritic-free spellings — and the disciplines and classes a type
 * declares, which is how someone looking for "ceva de matematică" finds it.
 *
 * It filters rather than hides by default: the paper's own discipline is NOT
 * applied as a silent filter. A teacher writing a Romanian paper may well want
 * an ordering exercise that declares itself mathematical, and a palette that
 * had quietly removed it would be indistinguishable from one that never had it.
 *
 * The icon is by CATEGORY, not by type. Fourteen distinct glyphs would be
 * fourteen things to learn and several of them arbitrary; nine categories the
 * registry already declares are a real grouping, and two exercises sharing a
 * mark is the mark telling the truth about them.
 *
 * ## Why the items carry a picture
 *
 * Sixteen full-width rows of Romanian text, all the same length, all the same
 * weight, is a list you read rather than scan — and the six layout names are
 * the worst of it, because "O treime și două treimi" and "Două treimi și o
 * treime" differ by word order alone. Each row now leads with the thing it
 * makes: a proportion diagram for a row, a glyph for a piece. The words stay
 * exactly as they were; the picture is a second channel, not a replacement,
 * which is also what keeps this off meaning-by-shape-alone.
 *
 * The pieces sit two to a line and the rows do not. That is not a rhythm
 * choice: piece names are one short word and layout names are five, and a
 * layout name in a 148px cell wraps onto three lines. Splitting only what fits
 * took the panel's own height from 983px to about 640 — which is what stopped
 * the last item of the second group being cut in half by the seam below it.
 *
 * The title bar is outside the scroller. It used to scroll away with the
 * content, so a teacher who had scrolled to the pieces was looking at an
 * unlabelled column of buttons.
 */

const PIECE_LABEL: Readonly<Record<PieceKind, string>> = Object.freeze({
  heading: EVALUATION_COPY.pieceHeading,
  paragraph: EVALUATION_COPY.pieceParagraph,
  list: EVALUATION_COPY.pieceList,
  quote: EVALUATION_COPY.pieceQuote,
  image: EVALUATION_COPY.pieceImage,
  divider: EVALUATION_COPY.pieceDivider,
  spacer: EVALUATION_COPY.pieceSpacer,
  table: EVALUATION_COPY.pieceTable,
  callout: EVALUATION_COPY.pieceCallout,
  answerSpace: EVALUATION_COPY.pieceAnswerSpace,
});

const PIECE_ICON: Readonly<Record<PieceKind, LucideIcon>> = Object.freeze({
  heading: Heading,
  paragraph: Pilcrow,
  list: List,
  quote: Quote,
  image: Image,
  divider: Minus,
  spacer: MoveVertical,
  table: Table,
  callout: StickyNote,
  answerSpace: PenLine,
});

const TEXT_PIECES: readonly PieceKind[] = [
  "heading",
  "paragraph",
  "list",
  "quote",
  "callout",
  "table",
];

const MARK_PIECES: readonly PieceKind[] = [
  "image",
  "divider",
  "spacer",
  "answerSpace",
];

const CATEGORY_ICON: Readonly<Record<ExerciseCategory, LucideIcon>> =
  Object.freeze({
    comprehension: BookOpen,
    vocabulary: Type,
    grammar: SpellCheck,
    computation: Calculator,
    problem_solving: Lightbulb,
    matching: ArrowLeftRight,
    ordering: ListOrdered,
    creative: Feather,
    observation: Eye,
  });

function Group({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Collapsible
      defaultOpen
      className="border-b border-border px-3 last:border-b-0"
    >
      {/* The trigger draws its own chevron and rotates it; a second one here
          was two arrows saying the same thing. Its type is the component's
          own — the override to 14px semibold made every group heading smaller
          than the buttons under it. */}
      <CollapsibleTrigger className="px-1">{title}</CollapsibleTrigger>
      <CollapsibleContent className="pt-0 pb-3">{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function LibraryPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <h2 className="shrink-0 border-b border-border px-4 py-3 text-base font-semibold text-panel-foreground">
        {EVALUATION_COPY.libraryTitle}
      </h2>

      {/**
       * The fade is a fact, not a flourish.
       *
       * Sixteen options and three group headings at CH07's 44px floor are 674px
       * of content, and the tallest this region gets on a supported window is
       * about 547px — so it scrolls, always, and the fold always lands across a
       * row. Before, that row was simply cut and the panel below it looked like
       * it was lying on top; the region now says "this continues" at its own
       * edge instead of leaving the teacher to infer it from half a word.
       *
       * `--panel` to transparent, so it is the panel's own surface thinning out
       * rather than a shadow, and `pointer-events-none` so it cannot take a
       * press meant for the option underneath.
       */}
      <div className="relative min-h-0 flex-1">
        <ScrollArea className="h-full">
          <Group title={EVALUATION_COPY.groupLayout}>
            <div className="flex flex-col gap-0.5">
              {SECTION_LAYOUT_ORDER.map((layout) => (
                <RowButton key={layout} layout={layout} />
              ))}
            </div>
          </Group>

          <Group title={EVALUATION_COPY.groupText}>
            <PieceGrid kinds={TEXT_PIECES} />
          </Group>

          <Group title={EVALUATION_COPY.groupMedia}>
            <PieceGrid kinds={MARK_PIECES} />
          </Group>

          <Group title={EVALUATION_COPY.groupExercises}>
            <ExerciseList />
          </Group>
        </ScrollArea>

        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-panel to-transparent"
        />
      </div>
    </div>
  );
}

/**
 * The searchable half of the library.
 *
 * One to a line, not two: exercise names are three and four words — "Alegere cu
 * mai multe răspunsuri" — where a piece name is one, and in a 148px cell that
 * wraps onto four lines. The same measurement that put the pieces two to a line
 * puts these one to a line.
 *
 * The query is local state and deliberately not in the editor store. It is a
 * fact about this panel in this session, so putting it in the document's store
 * would make it a candidate for autosave and would restore a stale filter to
 * whoever opened the paper next.
 *
 * The description is the button's `title` rather than a second line of text.
 * Fourteen two-line rows is 900px of panel; the sentence is a clarification for
 * the one name in ten that is not self-evident, and a pointer or a screen
 * reader reaches it either way.
 */
function ExerciseList() {
  const store = useEditorStore();
  const [query, setQuery] = useState("");

  const found = useMemo(
    () => EXERCISE_REGISTRY.search({ text: query.trim() || undefined }),
    [query],
  );

  return (
    <div className="flex flex-col gap-2">
      <Input
        type="search"
        value={query}
        aria-label={EVALUATION_COPY.librarySearch}
        placeholder={EVALUATION_COPY.librarySearchPlaceholder}
        onChange={(event) => setQuery(event.target.value)}
      />

      {found.length === 0 ? (
        <p className="px-2 py-3 text-sm text-muted-foreground">
          {EVALUATION_COPY.libraryEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-0.5">
          {found.map((definition) => {
            const Icon = CATEGORY_ICON[definition.category];
            return (
              <Button
                key={definition.type}
                variant="ghost"
                size="sm"
                title={definition.labels.description}
                className="h-auto min-h-11 justify-start gap-2 px-2 py-2 text-left font-normal whitespace-normal"
                onClick={() => addExercise(store, definition)}
              >
                <Icon aria-hidden strokeWidth={1.75} className="text-subtle" />
                {definition.labels.name}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Two to a line, and the label may wrap inside its own cell.
 *
 * `Button` sets `whitespace-nowrap`, which is right for a bar and wrong in a
 * 148px cell: "Loc de răspuns" would push the grid wider than the panel and
 * take the seam with it.
 */
function PieceGrid({ kinds }: { kinds: readonly PieceKind[] }) {
  return (
    <div className="grid grid-cols-2 gap-0.5">
      {kinds.map((kind) => (
        <PieceButton key={kind} kind={kind} />
      ))}
    </div>
  );
}

/**
 * One piece, addable two ways.
 *
 * A component per item rather than a hook call inside the `map`, because
 * `useDraggable` is a hook and a loop body is not a component. The alternative
 * — one draggable wrapping the whole grid — would have had to work out which
 * cell the press started in, which is the pointer arithmetic the seam model
 * exists to avoid.
 *
 * The cursor stays `pointer`, inherited from `Button`. `grab` is what the
 * handles on the paper use, and it is right there because picking up is the
 * only thing those boxes do; here pressing is the primary gesture and the
 * cursor should say so.
 */
function PieceButton({ kind }: { kind: PieceKind }) {
  const store = useEditorStore();
  const Icon = PIECE_ICON[kind];
  const { setNodeRef, listeners } = useLibraryDrag(`library-${kind}`, {
    kind: "library",
    piece: kind,
    label: EVALUATION_COPY.dragNewPiece(PIECE_LABEL[kind]),
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      variant="ghost"
      size="sm"
      className="justify-start gap-2 px-2 text-left font-normal whitespace-normal"
      onClick={() => addPiece(store, kind)}
    >
      <Icon aria-hidden strokeWidth={1.75} className="text-subtle" />
      {PIECE_LABEL[kind]}
    </Button>
  );
}

/** The same, one rank up: a row, which lands between rows and never inside one. */
function RowButton({ layout }: { layout: SectionLayout }) {
  const store = useEditorStore();
  const { setNodeRef, listeners } = useLibraryDrag(`library-row-${layout}`, {
    kind: "libraryRow",
    layout,
    label: EVALUATION_COPY.dragNewRow(LAYOUT_LABEL[layout]),
  });

  return (
    <Button
      ref={setNodeRef}
      {...listeners}
      variant="ghost"
      size="sm"
      className="justify-start gap-3 px-2 font-normal"
      onClick={() => addRow(store, layout)}
    >
      <LayoutMark layout={layout} />
      {LAYOUT_LABEL[layout]}
    </Button>
  );
}
