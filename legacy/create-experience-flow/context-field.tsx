import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { Badge, Label } from "@ludicon/ui";

import { FieldNote } from "./field-note";

export interface ContextFieldProps {
  htmlFor: string;
  label: string;
  /**
   * True only while the value is still the one read from the teacher's own
   * sentence. A fallback is never marked: a mark that also covered defaults
   * would stop meaning anything on the fields where it matters.
   */
  inferred: boolean;
  note?: string;
  noteId: string;
  children: ReactNode;
}

/** Label, an optional "read from what you wrote" mark, the control, a note. */
export function ContextField({
  htmlFor,
  label,
  inferred,
  note,
  noteId,
  children,
}: ContextFieldProps) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={htmlFor}>{label}</Label>
        {inferred ? (
          <Badge
            tone="neutral"
            icon={<Check aria-hidden strokeWidth={1.75} />}
            title="Citit din ce ai scris. Schimbă dacă nu se potrivește."
          >
            Dedus
          </Badge>
        ) : null}
      </div>
      {children}
      {note ? <FieldNote id={noteId}>{note}</FieldNote> : null}
    </div>
  );
}
