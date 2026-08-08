import { useId, useState, type ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  Slider,
} from "@ludicon/ui";

/**
 * The three shapes every inspector field takes, written once.
 *
 * `block-inspector.tsx` grew its own private `Field` and the theme panel would
 * have grown a second one; two of them is how a label ends up 14px in one
 * drawer and 16px in the next. This is the shared version, and the only reason
 * it is a new file rather than an export from `block-inspector.tsx` is that a
 * component file exporting a layout primitive makes every consumer import the
 * whole block inspector to get a `<div>`.
 *
 * ## The numeric field commits on RELEASE, not on every tick
 *
 * This is the one decision in here with teeth. `applyCommand` pushes a history
 * entry per call and `packages/evaluation/src/commands/history.ts` deliberately
 * does not coalesce — a command is the unit of undo, and merging two of them
 * would mean the history holds something the teacher never did. So a slider
 * that wrote on every change would spend a single drag of "make the text
 * bigger" filling thirty of the hundred available undo steps, and taking that
 * one change back would be thirty presses of ⌘Z.
 *
 * Radix's `onValueCommit` fires once per pointer gesture and once per arrow
 * press, which is exactly the grain a teacher experiences: one drag is one
 * change, one arrow press is one change. The cost is that the paper updates on
 * release rather than under the thumb, and the readout is live so the number is
 * never a surprise. The rejected alternative was a transient preview written
 * straight to the store — that is a second mutation path around the command
 * layer, which is the one thing this editor is built to not have.
 */

export interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}

export function Field({ label, htmlFor, hint, children }: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? (
        <p className="text-sm leading-[1.5] text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  /** Printed after the number: "mm", "pt", "%". Empty for a bare count. */
  unit?: string;
  /** How many decimals the readout shows; the value itself is never rounded. */
  decimals?: number;
  onCommit: (value: number) => void;
}

export function NumberField({
  label,
  value,
  min,
  max,
  step,
  unit,
  decimals = 0,
  onCommit,
}: NumberFieldProps) {
  /**
   * The thumb is uncontrolled DURING the drag and controlled between drags.
   *
   * `draft` is null when nobody is holding the slider, so the control shows the
   * document — which is what makes undo, a theme swap and a second panel all
   * move it. While a drag is running `draft` leads, because the document has
   * not been told yet and a slider that snapped back to the old value under the
   * thumb would be unusable.
   *
   * ## The draft is also cleared by the document moving, and it has to be
   *
   * `onValueCommit` alone was not enough, and the reason is an ordering inside
   * Radix rather than anything visible here. An ARROW press goes through
   * `updateValues(..., { commit: true })`, which calls `onValueCommit` from
   * INSIDE the state updater — so `setDraft(null)` below runs first and
   * `onValueChange`'s `setDraft(next)` runs after it, leaving the draft set to
   * the value that was just committed. Harmless while the two agree, and a
   * visible lie the moment they stop: arrow the spacer up three times, press
   * ⌘Z twice, and the paper says 9mm while the slider still says 11.
   *
   * So the draft is ALSO dropped whenever the value arriving from the document
   * changes, which is React's own "adjust state during render" pattern rather
   * than an effect — an effect would paint the stale number for one frame
   * first. A pointer drag is untouched by this: nothing is committed until the
   * thumb is released, so `value` does not move and the draft still leads.
   */
  const [draft, setDraft] = useState<number | null>(null);
  const [settled, setSettled] = useState(value);
  if (settled !== value) {
    setSettled(value);
    setDraft(null);
  }
  const shown = draft ?? value;

  return (
    <Field label={label}>
      <div className="flex items-center gap-3">
        <Slider
          value={[shown]}
          min={min}
          max={max}
          step={step}
          thumbLabels={[label]}
          onValueChange={([next]) => setDraft(next ?? shown)}
          onValueCommit={([next]) => {
            setDraft(null);
            if (next !== undefined && next !== value) onCommit(next);
          }}
        />
        {/**
         * Fixed width and tabular figures, so the number changing does not drag
         * the slider's right edge sideways while the thumb is moving.
         */}
        <span className="w-16 shrink-0 text-right text-sm tabular-nums text-muted-foreground">
          {shown.toFixed(decimals)}
          {unit ? ` ${unit}` : ""}
        </span>
      </div>
    </Field>
  );
}

export interface TextFieldProps {
  label: string;
  value: string;
  hint?: string;
  maxLength?: number;
  onCommit: (value: string) => void;
}

/**
 * A short text setting, committed when the teacher stops typing in it.
 *
 * Same argument as `NumberField`, one keystroke at a time: writing on every
 * `change` turns "p." into two commands and two undo steps, and a five-letter
 * label into five. Blur and Enter are the two moments a teacher has finished,
 * and both commit.
 *
 * Escape puts the field back to what the document says, which is the only way
 * out of a half-typed value that does not involve deleting it by hand.
 */
export function TextField({
  label,
  value,
  hint,
  maxLength,
  onCommit,
}: TextFieldProps) {
  const id = useFieldId("text");
  const [draft, setDraft] = useState<string | null>(null);

  const commit = () => {
    if (draft !== null && draft !== value) onCommit(draft);
    setDraft(null);
  };

  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        value={draft ?? value}
        maxLength={maxLength}
        onChange={(event) => setDraft(event.target.value)}
        onBlur={commit}
        onKeyDown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
            return;
          }
          if (event.key === "Escape") setDraft(null);
        }}
      />
    </Field>
  );
}

export interface FieldGroupProps {
  title: string;
  /** Open by default only for the things a teacher changes on most papers. */
  defaultOpen?: boolean;
  children: ReactNode;
}

/**
 * One disclosure of related fields.
 *
 * Every group is shut unless it is named as open, which is the whole point:
 * the design book forbids "a word-processor ribbon of 40 tools", and this panel
 * genuinely holds about forty settings. Two groups open — the colours and the
 * type — is what a teacher meets; the other three are one press away and stay
 * out of the way of the two.
 */
export function FieldGroup({
  title,
  defaultOpen = false,
  children,
}: FieldGroupProps) {
  return (
    <Collapsible
      defaultOpen={defaultOpen}
      className="border-b border-border px-4 last:border-b-0"
    >
      <CollapsibleTrigger>{title}</CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-5 pt-1 pb-4">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

/** A stable id per field instance, so a `<Label>` can point at its control. */
export const useFieldId = (name: string): string => `${useId()}${name}`;
