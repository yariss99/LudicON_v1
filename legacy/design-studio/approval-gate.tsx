import { useId, useState } from "react";
import { isApproved, type LessonPlan } from "@ludicon/domain";
import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Label,
  Textarea,
} from "@ludicon/ui";

import { MATERIALS_COPY } from "../materials/copy";

export type ApprovalGateProps = {
  plan: LessonPlan;
  /** True once every section the gate expects is complete. */
  ready: boolean;
  busy: boolean;
  /** Describes what is still expected, for the button's own description. */
  hintId?: string;
  onApprove: (note: string) => void;
  onContinue: () => void;
};

/**
 * The binding gate, as something the teacher does rather than something that
 * happens to them.
 *
 * Approval used to be a side effect of pressing the button that navigated to
 * the materials — the teacher was told nothing, asked nothing, and the one
 * moment the product calls constitutional passed without a word. It is a named
 * act now: the button says what it does, the confirmation says what it means,
 * and only the confirm inside it writes anything.
 *
 * The dialog is a plain one, not the alert kind. Confirming a design is a
 * commitment, not a demolition, and the alert pattern is reserved for what
 * cannot be undone in the destructive sense.
 */
export function ApprovalGate({
  plan,
  ready,
  busy,
  hintId,
  onApprove,
  onContinue,
}: ApprovalGateProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const noteId = useId();

  if (isApproved(plan)) {
    return (
      <Button variant="primary" onClick={onContinue}>
        {MATERIALS_COPY.continueAction}
      </Button>
    );
  }

  return (
    <>
      <Button
        variant="primary"
        disabled={!ready || busy}
        aria-describedby={ready ? undefined : hintId}
        onClick={() => setOpen(true)}
      >
        {busy ? MATERIALS_COPY.approveActionBusy : MATERIALS_COPY.approveAction}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{MATERIALS_COPY.approveTitle}</DialogTitle>
            <DialogDescription>{MATERIALS_COPY.approveBody}</DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex flex-col gap-2">
            <Label htmlFor={noteId}>{MATERIALS_COPY.approveNoteLabel}</Label>
            <Textarea
              id={noteId}
              rows={3}
              maxLength={500}
              value={note}
              placeholder={MATERIALS_COPY.approveNotePlaceholder}
              onChange={(event) => setNote(event.target.value)}
            />
          </div>

          <DialogFooter>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              {MATERIALS_COPY.approveCancel}
            </Button>
            <Button
              variant="primary"
              disabled={busy}
              onClick={() => {
                setOpen(false);
                onApprove(note);
              }}
            >
              {MATERIALS_COPY.approveConfirm}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
