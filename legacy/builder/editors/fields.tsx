import { useId, type ReactNode } from "react";
import {
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@ludicon/ui";

/**
 * Field primitives shared by all five editor panes.
 *
 * Labels are always rendered, never collapsed into a placeholder — CH07 is
 * explicit that a placeholder is not a label. There are no red asterisks:
 * required-ness is expressed by the guidance panel, not by decorating the form.
 */

export function TextField({
  label,
  hint,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function TextAreaField({
  label,
  hint,
  value,
  onChange,
  rows = 4,
  placeholder,
}: {
  label: string;
  hint?: string;
  value: string;
  onChange: (next: string) => void;
  rows?: number;
  placeholder?: string;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export function NumberField({
  label,
  hint,
  value,
  onChange,
  min = 0,
  max = 600,
}: {
  label: string;
  hint?: string;
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
}) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={String(value)}
        onChange={(event) => {
          const parsed = Number.parseInt(event.target.value, 10);
          onChange(Number.isNaN(parsed) ? min : parsed);
        }}
        className="max-w-40"
      />
    </div>
  );
}

export function ChoiceField<TValue extends string>({
  label,
  hint,
  value,
  options,
  onChange,
}: {
  label: string;
  hint?: string;
  value: TValue;
  options: Readonly<Record<TValue, string>>;
  onChange: (next: TValue) => void;
}) {
  const id = useId();
  const entries = Object.entries(options) as [TValue, string][];
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
      <Select value={value} onValueChange={(next) => onChange(next as TValue)}>
        <SelectTrigger id={id} className="max-w-72">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {entries.map(([key, optionLabel]) => (
            <SelectItem key={key} value={key}>
              {optionLabel}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

/**
 * One authoring block.
 *
 * Capped at `--block-max` and centred, per LESSON-001's 720px measure. The
 * heading is the section's own name, so the teacher always knows where they are
 * without reading the rail.
 */
export function SectionFrame({
  title,
  hint,
  children,
  actions,
}: {
  title: string;
  hint?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <section className="block-measure flex w-full flex-col gap-5 rounded-lg bg-card p-6 shadow-soft ring-1 ring-border">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-semibold text-strong">
            {title}
          </h2>
          {hint ? (
            <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
          ) : null}
        </div>
        {actions ? <div className="shrink-0">{actions}</div> : null}
      </div>
      {children}
    </section>
  );
}

/** A repeating child item — a phase, a scene, a slide, a question. */
export function ItemCard({
  title,
  meta,
  children,
  actions,
}: {
  title: string;
  meta?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <article className="flex flex-col gap-3 rounded-md bg-surface p-4 ring-1 ring-border">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-medium text-strong">
            {title}
          </h3>
          {meta ? <p className="text-sm text-subtle">{meta}</p> : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 items-center gap-1">{actions}</div>
        ) : null}
      </div>
      {children}
    </article>
  );
}
