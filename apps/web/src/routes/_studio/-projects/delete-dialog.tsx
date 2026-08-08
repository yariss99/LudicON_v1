import type { EvaluationProject } from "@ludicon/evaluation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ludicon/ui";

import { paperTitle } from "../-shared/paper-presentation";

export interface DeleteDialogProps {
  /** The paper awaiting confirmation, or `null` when the dialog is closed. */
  paper: EvaluationProject | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (paper: EvaluationProject) => void;
}

/**
 * The one place a paper is actually destroyed.
 *
 * Named in the title and again in the body, because "Ești sigur?" is a question
 * about nothing — a teacher with four similar evaluation titles open needs to
 * read back which one is about to go. The consequence is stated in the teacher's
 * own terms — the pages and the barem, which is what a paper actually contains
 * now that it is no longer a folder of materials — and the archive is offered as
 * the reversible alternative, since that is almost always what was wanted.
 *
 * One dialog for the whole page rather than one per card: mounting a modal for
 * every row would put a hidden dialog into the accessibility tree forty times
 * over on a busy account.
 */
export function DeleteDialog({
  paper,
  onOpenChange,
  onConfirm,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={paper !== null} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Ștergi „{paper === null ? "" : paperTitle(paper)}”?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Paginile și baremul dispar definitiv și nu mai pot fi recuperate.
            Dacă vrei doar să nu-l mai vezi în listă, mută-l în arhivă — de
            acolo îl poți aduce înapoi oricând.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <AlertDialogFooter>
          <AlertDialogCancel>Păstrează proiectul</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (paper) onConfirm(paper);
            }}
          >
            Șterge definitiv
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
