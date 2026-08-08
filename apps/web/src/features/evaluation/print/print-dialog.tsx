import { useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Printer } from "lucide-react";
import type { ValidationIssue } from "@ludicon/domain";
import type { ExerciseRegistry } from "@ludicon/evaluation";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  RadioGroup,
  RadioGroupItem,
  Separator,
} from "@ludicon/ui";

import { useEditor } from "../editor-context";
import { buildChecklist } from "../validation/checklist";
import { ChecklistView } from "../validation/checklist-view";
import { measurePageOverflow, overflowIssues } from "../validation/overflow";
import { CHECK_COPY } from "../validation/copy";
import { PRINT_COPY } from "./copy";
import { PrintSurface } from "./print-surface";
import { PRINT_VARIANTS, type PrintVariant } from "./print-variant";

/**
 * The step between pressing `Tipărește` and the print window opening.
 *
 * There was no step before this one: the button called `window.print()`
 * directly, with no stylesheet behind it, which printed the editor. Two
 * questions have to be answered before paper is spent, and neither of them has
 * a safe default the app could pick on the teacher's behalf:
 *
 *  - **which of the two outputs** — the pupils' paper or the teacher's copy.
 *    Guessing wrong in one direction hands thirty children the answers;
 *  - **is the paper finished** — `validateProject` has existed since the first
 *    slice and nothing has ever shown its output to anyone. A validator nobody
 *    reads is a comment.
 *
 * The rejected alternative was printing straight away and putting the checklist
 * somewhere permanent in the builder. It is less friction and it moves the
 * warning away from the moment it matters: the teacher who is about to spend
 * thirty sheets of paper is the one who needs to be told the fourth question on
 * page two will not print.
 *
 * ## The sheets are rendered while this is open, not when the button is pressed
 *
 * `PrintSurface` mounts with the dialog, which gives the browser time to lay
 * out and paint every sheet before `window.print()` is called on a second,
 * deliberate press — and gives `measurePageOverflow` something real to measure.
 * Rendering on the print press instead would mean measuring in the same frame
 * as printing, which is the one frame where being a paint behind is fatal.
 *
 * The dialog deliberately stays open during printing. Closing it first would
 * unmount the portal, and the print window would receive an empty page.
 */

export interface PrintDialogProps {
  registry: ExerciseRegistry;
  onClose: () => void;
}

const VARIANT_LABEL: Readonly<Record<PrintVariant, string>> = Object.freeze({
  student: PRINT_COPY.student,
  teacher: PRINT_COPY.teacher,
});

const VARIANT_EXPLANATION: Readonly<Record<PrintVariant, string>> =
  Object.freeze({
    student: PRINT_COPY.studentExplanation,
    teacher: PRINT_COPY.teacherExplanation,
  });

export function PrintDialog({ registry, onClose }: PrintDialogProps) {
  const document = useEditor((state) => state.document);
  const [variant, setVariant] = useState<PrintVariant>("student");
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const groupId = useId();

  /**
   * `null` until the sheets have been measured once, and that distinction is
   * shown: an empty list means "nothing wrong", and showing "nothing wrong"
   * before anything has been looked at would be the interface guessing.
   */
  const [measured, setMeasured] = useState<ValidationIssue[] | null>(null);

  /**
   * `useLayoutEffect`, because the portal's sheets are in the DOM by the time
   * effects run in the same commit, and a layout effect reads them before the
   * browser has a chance to paint a checklist built from stale numbers.
   *
   * Re-runs on the document and on the variant. The variant matters even though
   * the pupil's paper and the teacher's copy have identical pages: it is what
   * remounts the surface, and a measurement taken against a surface that is
   * about to be replaced is a measurement of the wrong sheets.
   */
  useLayoutEffect(() => {
    setMeasured(overflowIssues(measurePageOverflow(surfaceRef.current)));
  }, [document, variant]);

  const checklist = useMemo(
    () => buildChecklist(document, registry, measured ?? []),
    [document, registry, measured],
  );

  const pending = measured === null;

  return (
    <Dialog open onOpenChange={(next) => (next ? undefined : onClose())}>
      <PrintSurface
        document={document}
        registry={registry}
        variant={variant}
        surfaceRef={surfaceRef}
      />

      <DialogContent className="max-w-xl" closeLabel={PRINT_COPY.close}>
        <DialogHeader>
          <DialogTitle>{PRINT_COPY.title}</DialogTitle>
          <DialogDescription>{PRINT_COPY.lead}</DialogDescription>
        </DialogHeader>

        <section className="mt-5 min-w-0">
          <h3
            id={`${groupId}-choose`}
            className="mb-1 text-sm text-muted-foreground"
          >
            {PRINT_COPY.chooseLabel}
          </h3>
          <RadioGroup
            aria-labelledby={`${groupId}-choose`}
            value={variant}
            onValueChange={(next) => setVariant(next as PrintVariant)}
          >
            {PRINT_VARIANTS.map((option) => (
              <div key={option} className="flex items-start gap-2">
                <RadioGroupItem
                  id={`${groupId}-${option}`}
                  value={option}
                  className="mt-0.5"
                />
                <Label
                  htmlFor={`${groupId}-${option}`}
                  className="flex min-h-11 cursor-pointer flex-col justify-center gap-0.5 py-1"
                >
                  <span className="text-base text-foreground">
                    {VARIANT_LABEL[option]}
                  </span>
                  <span className="text-sm font-normal text-muted-foreground">
                    {VARIANT_EXPLANATION[option]}
                  </span>
                </Label>
              </div>
            ))}
          </RadioGroup>
        </section>

        <Separator className="my-5" />

        <section className="min-w-0">
          <h3 className="text-base text-strong">{CHECK_COPY.title}</h3>
          <p className="mb-1 text-sm text-muted-foreground">
            {CHECK_COPY.lead}
          </p>
          <ChecklistView checklist={checklist} pending={pending} />
        </section>

        <Separator className="my-5" />

        {/**
         * Two things the browser will not do for us, said before the print
         * window opens rather than discovered after a wasted sheet. They are
         * notes rather than warnings — neither is a fault, and a teacher who
         * does not care about colour should not be told off about it.
         */}
        <div className="flex flex-col gap-3 text-sm">
          <p className="text-muted-foreground">
            <span className="text-foreground">
              {PRINT_COPY.backgroundsTitle}
            </span>
            {" · "}
            {PRINT_COPY.backgroundsExplanation}
          </p>
          <p className="text-muted-foreground">
            <span className="text-foreground">{PRINT_COPY.pdfTitle}</span>
            {" · "}
            {PRINT_COPY.pdfExplanation}
          </p>
        </div>

        <DialogFooter>
          {checklist.canPrint ? null : (
            <p className="mr-auto text-sm text-muted-foreground">
              {CHECK_COPY.blockedHint}
            </p>
          )}
          <Button variant="ghost" size="sm" onClick={onClose}>
            {PRINT_COPY.cancel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            disabled={pending || !checklist.canPrint}
            onClick={() => globalThis.print()}
          >
            <Printer aria-hidden strokeWidth={1.75} />
            {pending ? PRINT_COPY.preparing : PRINT_COPY.open}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
