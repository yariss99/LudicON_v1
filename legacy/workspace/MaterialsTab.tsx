import { Plus } from "lucide-react";
import { ASSET_KIND_LABEL, type ProjectId } from "@ludicon/domain";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  EmptyState,
} from "@ludicon/ui";

import type { AnyDocument } from "../../lib/documents";
import { BUILDER_KINDS, type BuilderKind } from "../builder/types";
import { WORKSPACE_COPY } from "./copy";
import { MaterialRow } from "./MaterialRow";
import { useMaterialActions } from "./useWorkspace";

export type MaterialsTabProps = {
  projectId: ProjectId;
  documents: readonly AnyDocument[];
  onAdd: (kind: BuilderKind) => void;
};

/**
 * One list for every asset kind.
 *
 * The old workspace gave each kind its own tab, its own repository call and its
 * own create form — six near-identical screens. A material is a material.
 *
 * Copying and deleting are read from the data layer here rather than taken as
 * props: they concern the material and nothing else on the page, so threading
 * them down through the surface that merely hosts this panel would make the
 * host responsible for something it has no part in.
 */
export function MaterialsTab({
  projectId,
  documents,
  onAdd,
}: MaterialsTabProps) {
  const { duplicateMaterial, removeMaterial } = useMaterialActions();

  return (
    <section aria-labelledby="materiale">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="materiale"
            className="font-display text-xl font-semibold text-strong"
          >
            {WORKSPACE_COPY.materialsHeading}
          </h2>
          <p className="mt-1 text-muted-foreground">
            {WORKSPACE_COPY.materialsLead}
          </p>
        </div>
        <AddMaterialMenu onAdd={onAdd} />
      </div>

      {documents.length === 0 ? (
        <EmptyState
          title={WORKSPACE_COPY.emptyMaterialsTitle}
          explanation={WORKSPACE_COPY.emptyMaterialsExplanation}
          action={<AddMaterialMenu onAdd={onAdd} primary />}
        />
      ) : (
        <ul className="flex flex-col gap-3">
          {documents.map((document) => (
            <li key={document.id}>
              <MaterialRow
                projectId={projectId}
                document={document}
                onDuplicate={(target) => void duplicateMaterial(target)}
                onRemove={(target) => void removeMaterial(target)}
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function AddMaterialMenu({
  onAdd,
  primary = false,
}: {
  onAdd: (kind: BuilderKind) => void;
  primary?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={primary ? "primary" : "secondary"} size="sm">
          <Plus aria-hidden size={18} strokeWidth={1.75} />
          {WORKSPACE_COPY.addMaterial}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {BUILDER_KINDS.map((kind) => (
          <DropdownMenuItem key={kind} onSelect={() => onAdd(kind)}>
            {ASSET_KIND_LABEL[kind]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { formatDate } from "./MaterialRow";
