import {
  Button,
  Checkbox,
  Label,
  SectionHeader,
  StatusBadge,
} from "@ludicon/ui";

import type { BuilderKind } from "../builder/types";
import { KIND_HINT, kindLabel, OFFERED_KINDS } from "./catalog";
import { MATERIALS_COPY } from "./copy";

export type MaterialPickerProps = {
  chosen: ReadonlySet<BuilderKind>;
  /** Kinds already prepared for this lesson, offered but not re-offered. */
  prepared: ReadonlySet<string>;
  busy: boolean;
  onToggle: (kind: BuilderKind) => void;
  onPrepare: () => void;
};

/**
 * What the teacher asks for, once the design is theirs.
 *
 * Every kind offered here has somewhere to land — see `catalog.ts`. A picker
 * that offers a material nothing can open is not a richer menu, it is a
 * promise the product cannot keep.
 */
export function MaterialPicker({
  chosen,
  prepared,
  busy,
  onToggle,
  onPrepare,
}: MaterialPickerProps) {
  return (
    <>
      <SectionHeader
        title={MATERIALS_COPY.pickerTitle}
        supporting={MATERIALS_COPY.pickerLead}
      />

      <ul className="mt-8 grid gap-3 tablet:grid-cols-2">
        {OFFERED_KINDS.map((kind) => {
          const made = prepared.has(kind);
          const inputId = `material-${kind}`;

          return (
            <li key={kind}>
              <div className="flex h-full items-start gap-2 rounded-lg bg-card p-4 ring-1 ring-border">
                <Checkbox
                  id={inputId}
                  checked={made || chosen.has(kind)}
                  disabled={made}
                  onChange={() => onToggle(kind)}
                />
                <div className="min-w-0 flex-1 pt-2.5">
                  <Label htmlFor={inputId} className="text-base">
                    {kindLabel(kind)}
                  </Label>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {KIND_HINT[kind]}
                  </p>
                  {made ? (
                    <StatusBadge
                      className="mt-2"
                      status="draft"
                      label={MATERIALS_COPY.alreadyMade}
                    />
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <Button
          variant="primary"
          size="lg"
          disabled={chosen.size === 0 || busy}
          onClick={onPrepare}
        >
          {busy ? MATERIALS_COPY.preparing : MATERIALS_COPY.prepare}
        </Button>
        <p className="text-sm text-muted-foreground">
          {chosen.size === 0
            ? MATERIALS_COPY.pickSomething
            : chosen.size === 1
              ? MATERIALS_COPY.chosenOne
              : MATERIALS_COPY.chosenMany(chosen.size)}
        </p>
      </div>
    </>
  );
}
