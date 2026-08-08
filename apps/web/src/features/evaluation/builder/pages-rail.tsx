import { Plus, Trash2 } from "lucide-react";
import { pagesInOrder, type PageId } from "@ludicon/evaluation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  ScrollArea,
  cn,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { addSheet, removeSheet } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { openPage } from "../editor-store";

/**
 * The sheets, in print order.
 *
 * Each entry is a rectangle at A4's real proportions rather than a rendered
 * thumbnail. A live miniature would mean rendering the whole document a second
 * time on every keystroke, and at this size it would show a grey smear that
 * tells a teacher nothing the page number does not. The proportion is what
 * carries the meaning: it says "this is a sheet of paper", which is the fact
 * the rail exists to establish.
 *
 * Removing a sheet asks first. It takes everything on the page with it and the
 * command's inverse is only reachable through undo, which a teacher who has
 * just navigated away cannot use — so the confirmation is the safety, not the
 * history.
 *
 * ## Which sheet you are on
 *
 * The current entry used to switch to `font-semibold`. That is the exact fault
 * `packages/ui/src/components/tabs.tsx` documents and removes: heavier glyphs
 * measure wider, so the label re-laid out on every change of page and the
 * column shook. Weight is now constant and the state is carried by three things
 * that are not weight — the tinted pill, the sheet drawn filled rather than
 * empty, and `aria-current`. Two of those are shapes, so this is not
 * meaning-by-colour-alone either.
 */

export function PagesRail() {
  const store = useEditorStore();
  const document = useEditor((state) => state.document);
  const currentPageId = useEditor((state) => state.currentPageId);

  const pages = pagesInOrder(document);
  const onlyPage = pages.length <= 1;

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-panel">
      <h2 className="shrink-0 border-b border-border px-4 py-3 text-base font-semibold text-panel-foreground">
        {EVALUATION_COPY.pages}
      </h2>

      <ScrollArea className="min-h-0 flex-1">
        <ul className="flex flex-col gap-1 px-3 py-3">
          {pages.map((page, index) => {
            const label =
              index === 0
                ? EVALUATION_COPY.pageCover
                : EVALUATION_COPY.pageNumbered(index + 1);
            const active = page.id === currentPageId;

            return (
              <li key={page.id} className="flex items-center gap-1">
                <button
                  type="button"
                  aria-current={active ? "true" : undefined}
                  onClick={() => openPage(store, page.id as PageId)}
                  className={cn(
                    "flex min-h-11 flex-1 cursor-pointer items-center gap-3 rounded-md p-2 text-left",
                    "text-base font-medium",
                    "transition-colors duration-[var(--motion-fast)] ease-standard",
                    active
                      ? "bg-primary-soft text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {/* A4's own ratio, so the chip reads as a sheet of paper —
                      inked when this is the sheet you are on, blank when it is
                      not. The fill is the second signal beside the pill. */}
                  <span
                    aria-hidden
                    className={cn(
                      "h-9 shrink-0 rounded-[2px] border",
                      active
                        ? "border-primary bg-primary"
                        : "border-border-strong bg-surface",
                    )}
                    style={{ aspectRatio: "210 / 297" }}
                  />
                  <span className="min-w-0 truncate">{label}</span>
                </button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="size-11 px-0"
                      aria-label={EVALUATION_COPY.removePage}
                      disabled={onlyPage}
                    >
                      <Trash2 aria-hidden strokeWidth={1.75} />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        {EVALUATION_COPY.removePage}
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {EVALUATION_COPY.removePageConfirm}
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>
                        {EVALUATION_COPY.createCancel}
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => removeSheet(store, page.id as PageId)}
                      >
                        {EVALUATION_COPY.removePage}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </li>
            );
          })}
        </ul>
      </ScrollArea>

      <div className="border-t border-border p-3">
        <Button
          variant="secondary"
          size="sm"
          className="w-full"
          onClick={() => addSheet(store)}
        >
          <Plus aria-hidden strokeWidth={1.75} />
          {EVALUATION_COPY.addPage}
        </Button>
      </div>
    </div>
  );
}
