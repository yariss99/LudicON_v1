import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
import { Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  Check,
  ClipboardList,
  Eye,
  Pencil,
  Printer,
  Redo2,
  TriangleAlert,
  Undo2,
  type LucideIcon,
} from "lucide-react";
import { canRedo, canUndo } from "@ludicon/evaluation";
import { Button, Input, Separator, cn } from "@ludicon/ui";

import { BAREM_COPY } from "../barem/copy";
import { BaremDialog } from "../barem/barem-dialog";
import type { RenderMode } from "../canvas/block-view";
import { EVALUATION_COPY } from "../copy";
import { renamePaper } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { redoEdit, undoEdit } from "../editor-store";
import { outputExerciseRegistry } from "../print/exercise-registry";
import { PrintDialog } from "../print/print-dialog";
import type { SaveState } from "../use-autosave";

/**
 * The one bar across the top, and everything in it belongs to the paper rather
 * than to a panel.
 *
 * The title is the house inline-edit pattern: a button that becomes an `<Input>`
 * when clicked, commits on blur or Enter, and abandons on Escape. It is not a
 * permanently open field, because a text box in a toolbar reads as something
 * that needs filling in, and the title arrived from the create form already
 * filled.
 *
 * Undo and redo are disabled at the ends of the history rather than hidden.
 * A control that disappears takes its neighbours' positions with it, and these
 * two are pressed repeatedly and by muscle memory.
 *
 * The save state is words, never a colour on its own — "Se salvează…" and
 * "Salvat" say what happened; a green dot only says it to someone who can see
 * green. It now carries a glyph as well, which is a third channel rather than a
 * replacement for either.
 *
 * ## Grouping, and why the bar does not wrap
 *
 * Six controls in a row, sorted by what they act on: leaving, the paper's name,
 * the paper's history and whether it is written down, then the two things you
 * do with a finished paper. The two hairlines mark those last two boundaries.
 * Without them the save state read as a sixth button.
 *
 * `flex-wrap` is gone. A toolbar that wraps is a toolbar that gets taller, and
 * everything under it — which here is the paper — moves down a row. It wrapped
 * for one reason: the save state's failure sentence is 47 characters and it
 * pushed the print button off the end. That sentence is now the title of a
 * short label, so the row has a width it cannot exceed and the canvas never
 * moves.
 *
 * ## Printing is now two presses, and the barem has a door
 *
 * `Tipărește` used to call `window.print()` from here, with no print stylesheet
 * anywhere in the app — so it printed the toolbar, both rails and the paper at
 * whatever zoom was set. It now opens `PrintDialog`, which is where the two
 * questions that must be answered before paper is spent live: which of the two
 * outputs, and is the paper finished. See that file for why the checklist
 * belongs at that moment rather than permanently in the builder.
 *
 * `Baremul` is a third control in the last group rather than a panel beside the
 * paper. The barem is read while marking, not while writing, and a rail that is
 * open the whole time someone is authoring takes width from the one region that
 * has more to show than it can fit.
 *
 * Both dialogs are mounted only while open — `{open ? <Dialog/> : null}` and
 * not an `open` prop on a permanently mounted one. Each subscribes to the whole
 * document, and a permanently mounted subscriber would re-render this bar on
 * every keystroke in the paper.
 *
 * The registry is resolved HERE, once, and handed to both. It is the app's
 * answer to "which exercise types exist", and threading it as a value is what
 * keeps the barem and the checklist from importing a module-level singleton
 * whose contents can change between two calls — see `print/exercise-registry.ts`.
 */

const SAVE_LABEL: Readonly<Record<SaveState, string>> = Object.freeze({
  idle: EVALUATION_COPY.saveIdle,
  saving: EVALUATION_COPY.saveSaving,
  saved: EVALUATION_COPY.saveSaved,
  failed: EVALUATION_COPY.saveFailedShort,
});

/** `saving` has none: the ellipsis in its own label is the moving part. */
const SAVE_ICON: Readonly<Record<SaveState, LucideIcon | null>> = Object.freeze(
  {
    idle: Check,
    saving: null,
    saved: Check,
    failed: TriangleAlert,
  },
);

export interface BuilderToolbarProps {
  saveState: SaveState;
  mode: RenderMode;
  onModeChange: (mode: RenderMode) => void;
}

export function BuilderToolbar({
  saveState,
  mode,
  onModeChange,
}: BuilderToolbarProps) {
  const store = useEditorStore();
  const title = useEditor((state) => state.document.meta.title);
  const history = useEditor((state) => state.history);
  const [renaming, setRenaming] = useState(false);
  const [draft, setDraft] = useState(title);
  const [printing, setPrinting] = useState(false);
  const [showingBarem, setShowingBarem] = useState(false);
  const registry = outputExerciseRegistry();

  /**
   * Ctrl+P has to end up in the same place as the button.
   *
   * `print.css` hides everything that is not the print surface, and the surface
   * only exists while `PrintDialog` is mounted — so a teacher reaching for the
   * keyboard shortcut instead of the button would have printed a blank sheet.
   * That is a worse outcome than the one this slice set out to fix: the old
   * behaviour printed the editor, which is misleading, and blank paper is
   * misleading too, just more quietly.
   *
   * `flushSync` is doing the load-bearing work and is the reason this is not an
   * ordinary `setState`. `beforeprint` fires immediately before the browser
   * takes its snapshot of the document, and React would otherwise batch the
   * update into a later frame — the snapshot would be taken of a page with no
   * surface in it, and the shortcut would print blank exactly once before
   * mysteriously working the second time. Flushing renders the sheets inside
   * the handler, so they are in the DOM when the snapshot is taken.
   *
   * The checklist cannot gate this route — nothing can cancel a print the
   * operating system has already begun — so the shortcut prints the pupils'
   * paper, which is the safe default, and leaves the dialog open behind it with
   * whatever the checklist found. The rejected alternative was to keep the
   * surface mounted for the whole session so the shortcut needed no handling at
   * all: that is a second full render of the document on every keystroke, paid
   * permanently for a case that happens once.
   */
  useEffect(() => {
    if (printing) return;
    const onBeforePrint = () => flushSync(() => setPrinting(true));
    window.addEventListener("beforeprint", onBeforePrint);
    return () => window.removeEventListener("beforeprint", onBeforePrint);
  }, [printing]);

  const commit = () => {
    renamePaper(store, draft.trim());
    setRenaming(false);
  };

  const SaveIcon = SAVE_ICON[saveState];

  return (
    <header className="flex min-h-16 shrink-0 items-center gap-2 border-b border-border bg-surface px-4">
      <Button variant="ghost" size="sm" asChild>
        <Link to="/projects">
          <ArrowLeft aria-hidden strokeWidth={1.75} />
          {EVALUATION_COPY.exit}
        </Link>
      </Button>

      <div className="min-w-0 flex-1">
        {renaming ? (
          <Input
            autoFocus
            value={draft}
            aria-label={EVALUATION_COPY.renameLabel}
            className="max-w-96"
            onChange={(event) => setDraft(event.target.value)}
            onBlur={commit}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit();
              }
              if (event.key === "Escape") {
                event.preventDefault();
                setDraft(title);
                setRenaming(false);
              }
            }}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setDraft(title);
              setRenaming(true);
            }}
            className="group flex min-h-11 max-w-full cursor-pointer items-center gap-2 rounded-sm px-2 text-left font-display text-lg font-semibold text-foreground"
          >
            <span className="min-w-0 truncate">
              {title.trim() === "" ? EVALUATION_COPY.untitled : title}
            </span>
            <Pencil
              aria-hidden
              size={16}
              strokeWidth={1.75}
              className="shrink-0 text-subtle opacity-0 transition-opacity duration-[var(--motion-fast)] ease-standard group-hover:opacity-100"
            />
            <span className="sr-only">{EVALUATION_COPY.renameLabel}</span>
          </button>
        )}
      </div>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="size-11 px-0"
          aria-label={EVALUATION_COPY.undo}
          disabled={!canUndo(history)}
          onClick={() => undoEdit(store)}
        >
          <Undo2 aria-hidden strokeWidth={1.75} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="size-11 px-0"
          aria-label={EVALUATION_COPY.redo}
          disabled={!canRedo(history)}
          onClick={() => redoEdit(store)}
        >
          <Redo2 aria-hidden strokeWidth={1.75} />
        </Button>
      </div>

      {/* The whole sentence stays reachable by pointer and by screen reader;
          only the bar is spared it. */}
      <p
        aria-live="polite"
        title={saveState === "failed" ? EVALUATION_COPY.saveFailed : undefined}
        className={cn(
          "flex shrink-0 items-center gap-1.5 text-sm",
          saveState === "failed" ? "text-destructive" : "text-muted-foreground",
        )}
      >
        {SaveIcon ? (
          <SaveIcon aria-hidden strokeWidth={1.75} className="size-4" />
        ) : null}
        {SAVE_LABEL[saveState]}
      </p>

      <Separator orientation="vertical" className="h-6 shrink-0" />

      <div className="flex shrink-0 items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => setShowingBarem(true)}>
          <ClipboardList aria-hidden strokeWidth={1.75} />
          {BAREM_COPY.open}
        </Button>

        <Button
          variant="secondary"
          size="sm"
          onClick={() => onModeChange(mode === "edit" ? "preview" : "edit")}
        >
          <Eye aria-hidden strokeWidth={1.75} />
          {mode === "edit" ? EVALUATION_COPY.preview : EVALUATION_COPY.edit}
        </Button>

        <Button variant="primary" size="sm" onClick={() => setPrinting(true)}>
          <Printer aria-hidden strokeWidth={1.75} />
          {EVALUATION_COPY.print}
        </Button>
      </div>

      {showingBarem ? (
        <BaremDialog
          registry={registry}
          onClose={() => setShowingBarem(false)}
        />
      ) : null}

      {printing ? (
        <PrintDialog registry={registry} onClose={() => setPrinting(false)} />
      ) : null}
    </header>
  );
}
