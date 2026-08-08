import { Archive, ArchiveRestore, MoreHorizontal, Trash2 } from "lucide-react";
import type { EvaluationProject } from "@ludicon/evaluation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  cn,
} from "@ludicon/ui";
import { DropdownMenuTrigger } from "@ludicon/ui";

import { paperTitle } from "../-shared/paper-presentation";

export interface ProjectMenuProps {
  paper: EvaluationProject;
  onArchive: (paper: EvaluationProject) => void;
  onRestore: (paper: EvaluationProject) => void;
  onDelete: (paper: EvaluationProject) => void;
}

/**
 * What can be done to a project, without leaving the list.
 *
 * An overflow menu rather than a row of icons: archiving and deleting are rare
 * and one of them is irreversible, so neither has earned a permanent target
 * sitting a few pixels from the card's own link.
 *
 * Delete is separated by a rule and carries the destructive tone plus its own
 * icon and word — never a red glyph on its own. It does not delete anything; it
 * opens a confirmation, which is the only place the record is actually removed.
 */
export function ProjectMenu({
  paper,
  onArchive,
  onRestore,
  onDelete,
}: ProjectMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Acțiuni pentru „${paperTitle(paper)}”`}
        className={cn(
          "inline-flex size-11 cursor-pointer items-center justify-center rounded-full",
          "text-muted-foreground",
          "transition-colors duration-[var(--motion-fast)] ease-standard",
          "hover:bg-muted hover:text-foreground",
          "data-[state=open]:bg-muted data-[state=open]:text-foreground",
        )}
      >
        <MoreHorizontal aria-hidden strokeWidth={1.75} className="size-5" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        {paper.archived ? (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => onRestore(paper)}
          >
            <ArchiveRestore aria-hidden strokeWidth={1.75} />
            Scoate din arhivă
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            className="cursor-pointer"
            onSelect={() => onArchive(paper)}
          >
            <Archive aria-hidden strokeWidth={1.75} />
            Mută în arhivă
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="cursor-pointer text-destructive"
          onSelect={() => onDelete(paper)}
        >
          <Trash2 aria-hidden strokeWidth={1.75} />
          Șterge definitiv
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
