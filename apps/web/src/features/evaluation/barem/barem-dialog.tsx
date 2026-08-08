import { useMemo } from "react";
import { CircleAlert } from "lucide-react";
import type { ExerciseRegistry } from "@ludicon/evaluation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmptyState,
  Separator,
} from "@ludicon/ui";

import { InlineView } from "../canvas/inline-view";
import { useEditor } from "../editor-context";
import { BAREM_COPY } from "./copy";
import { baremRows, baremTotal, type BaremRow } from "./barem-rows";

/**
 * The barem on screen: the same rows the teacher's copy prints, in the
 * product's own colours.
 *
 * Deliberately a SECOND presentation of `barem-rows.ts`, not a second
 * derivation. Everything shown here — the order, the names, the points, the
 * total — comes from the same two functions the printed sheet calls, so the
 * sheet and the screen cannot disagree about what the answer to question 7 is.
 * What differs is only the paint: this one uses the design system's semantic
 * tokens because it is chrome and follows the reader's light/dark preference,
 * and `barem-sheet.tsx` uses the document's theme because paper has no
 * preference. Sharing one component across both was the rejected alternative —
 * it would have to be handed a colour scheme, which is the seam that eventually
 * puts a dark-mode grey on a printed page.
 *
 * The total is added up here, in front of the teacher, and stored nowhere.
 * `answer-key.ts` makes the argument: a total that can disagree with the sheet
 * printed beneath it is worse than no total, and the only place that
 * disagreement would surface is a classroom.
 *
 * A row is not a table row. A `<table>` is the obvious shape for "answer,
 * points, note" and it is wrong for this content: the clarification and the
 * teacher's note are sentences, and a three-column grid sized for the longest
 * of them leaves the points column mostly empty on every other row.
 */

export interface BaremDialogProps {
  registry: ExerciseRegistry;
  onClose: () => void;
}

export function BaremDialog({ registry, onClose }: BaremDialogProps) {
  const document = useEditor((state) => state.document);
  const rows = useMemo(
    () => baremRows(document, registry),
    [document, registry],
  );
  const total = baremTotal(rows);

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <DialogContent className="max-w-2xl" closeLabel={BAREM_COPY.close}>
        <DialogHeader>
          <DialogTitle>{BAREM_COPY.title}</DialogTitle>
          <DialogDescription>{BAREM_COPY.lead}</DialogDescription>
        </DialogHeader>

        {rows.length === 0 ? (
          <div className="py-6">
            <EmptyState
              title={BAREM_COPY.emptyTitle}
              explanation={BAREM_COPY.emptyExplanation}
            />
          </div>
        ) : (
          <>
            <ol className="mt-5 flex flex-col">
              {rows.map((row) => (
                <RowView key={row.blockId} row={row} />
              ))}
            </ol>

            <Separator className="mt-4" />

            <p className="flex items-baseline justify-end gap-3 pt-3 text-base text-strong">
              <span>{BAREM_COPY.total}</span>
              <span className="tabular-nums">
                {BAREM_COPY.pointsLabel(total)}
              </span>
            </p>
          </>
        )}

        <DialogFooter>
          <Button variant="secondary" size="sm" onClick={onClose}>
            {BAREM_COPY.close}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * One entry.
 *
 * A missing answer is said in words and marked with a glyph, never by a colour
 * or by an empty space where the answer should be. An empty space reads as "the
 * answer is blank", which for a fill-in exercise is a plausible answer.
 */
function RowView({ row }: { row: BaremRow }) {
  return (
    <li className="border-b border-border py-3 last:border-b-0">
      <div className="flex items-baseline gap-2">
        <span className="tabular-nums text-muted-foreground">
          {row.position}.
        </span>
        <span className="min-w-0 flex-1 text-base text-strong">{row.name}</span>
        <span className="shrink-0 tabular-nums text-base text-muted-foreground">
          {BAREM_COPY.pointsLabel(row.points)}
        </span>
      </div>

      {row.prompt === "" ? null : (
        <p className="mt-1 text-sm leading-[1.5] text-muted-foreground">
          {row.prompt}
        </p>
      )}

      <p className="mt-2 text-base leading-[1.5] text-foreground">
        <span className="text-sm text-muted-foreground">
          {BAREM_COPY.answer}:{" "}
        </span>
        {row.answered ? (
          row.answer
        ) : (
          <span className="inline-flex items-center gap-1.5 align-baseline text-muted-foreground">
            <CircleAlert
              aria-hidden
              strokeWidth={1.75}
              className="size-4 shrink-0"
            />
            {BAREM_COPY.answerNotSet}
          </span>
        )}
      </p>

      {row.clarification === "" ? null : (
        <p className="mt-1 text-sm leading-[1.5] text-muted-foreground">
          <span>{BAREM_COPY.clarification}: </span>
          {row.clarification}
        </p>
      )}

      {row.note.length === 0 ? null : (
        <p className="mt-1 text-sm leading-[1.5] text-muted-foreground">
          <span>{BAREM_COPY.note}: </span>
          <InlineView nodes={row.note} />
        </p>
      )}
    </li>
  );
}
