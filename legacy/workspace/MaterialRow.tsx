import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { ASSET_KIND_LABEL, type ProjectId } from "@ludicon/domain";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  StatusBadge,
} from "@ludicon/ui";

import type { AnyDocument } from "../../lib/documents";
import { isBuilderKind } from "../builder/types";
import { WORKSPACE_COPY } from "./copy";

export type MaterialRowProps = {
  projectId: ProjectId;
  document: AnyDocument;
  onDuplicate: (document: AnyDocument) => void;
  onRemove: (document: AnyDocument) => void;
};

/**
 * One material, with the things a teacher actually wants to do to it.
 *
 * The panel used to offer a single `Deschide` button and nothing else, so
 * copying a material meant opening it, and removing one was impossible from
 * the place that lists them. Deleting is the only action behind a confirmation,
 * because it is the only one that cannot be taken back.
 */
export function MaterialRow({
  projectId,
  document,
  onDuplicate,
  onRemove,
}: MaterialRowProps) {
  const [confirming, setConfirming] = useState(false);
  // Read into a local so the predicate narrows it — a property access cannot be
  // narrowed by a boolean held somewhere else.
  const kind = document.kind;

  return (
    <article className="flex flex-wrap items-center gap-4 rounded-md bg-card p-4 ring-1 ring-border transition-shadow duration-[--motion-fast] hover:shadow-soft">
      <div className="min-w-0 flex-1">
        <h3 className="truncate font-medium text-card-foreground">
          {document.title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {ASSET_KIND_LABEL[document.kind]} · {WORKSPACE_COPY.updatedOn}{" "}
          {formatDate(document.updatedAt)}
        </p>
      </div>

      <StatusBadge status={document.status} />

      {isBuilderKind(kind) ? (
        <Button variant="secondary" size="sm" asChild>
          <Link
            to="/builder/$projectId/$kind/$documentId"
            params={{
              projectId,
              kind,
              documentId: document.id,
            }}
          >
            {WORKSPACE_COPY.openMaterial}
          </Link>
        </Button>
      ) : null}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label={WORKSPACE_COPY.materialActions}
          >
            <MoreHorizontal aria-hidden size={18} strokeWidth={1.75} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onDuplicate(document)}>
            {WORKSPACE_COPY.duplicateMaterial}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setConfirming(true)}>
            {WORKSPACE_COPY.removeMaterial}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {WORKSPACE_COPY.removeMaterialTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {WORKSPACE_COPY.removeMaterialBody}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {WORKSPACE_COPY.removeMaterialCancel}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => onRemove(document)}>
              {WORKSPACE_COPY.removeMaterialConfirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  );
}

export function formatDate(value: string): string {
  return new Intl.DateTimeFormat("ro-RO", {
    day: "numeric",
    month: "long",
  }).format(new Date(value));
}
