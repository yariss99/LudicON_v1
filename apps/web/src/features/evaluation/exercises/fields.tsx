import { useId, type ReactNode } from "react";
import {
  Checkbox,
  Input,
  Label,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from "@ludicon/ui";

/**
 * The controls an exercise is written with, shared by every type.
 *
 * ## A list is a textarea, one item per line
 *
 * The obvious design is a stack of inputs with an "adaugă" button and a bin
 * beside each row. It was rejected for three measured reasons. It puts four
 * controls in a 344px rail where two fit; every add and remove is a separate
 * step of undo, so a teacher who typed four options presses ⌘Z eight times to
 * get back; and rearranging means dragging, which is the one interaction this
 * builder deliberately does not have because the keyboard cannot reach it.
 *
 * A textarea is one control, one undoable edit per pause in typing, and
 * reordering is cut-and-paste — which every teacher already knows how to do.
 * It is also the only version where a teacher can paste four options in from a
 * document they already had, which is how most of these papers actually start.
 *
 * The cost is real and worth naming: a line cannot carry per-item formatting.
 * Options in a Romanian evaluation are plain words, so nothing is lost today;
 * the day one needs bold, this becomes a different control rather than a
 * textarea with markup in it.
 *
 * ## No colour carries meaning here
 *
 * Every field is label plus control plus an optional sentence. Nothing is
 * marked wrong in red — what is unfinished is said in words by the paper's own
 * checklist, in Romanian, with a next step. The design system's `--muted` tint
 * does the focus work, and no weight changes between states: a label that went
 * semibold when its field was focused would re-measure and shift the column.
 */

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

/** A group of fields with a quiet heading, for "the question" vs "the barem". */
export function FieldGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {children}
    </section>
  );
}

/**
 * Lines in, lines out — with the teacher's blank lines left exactly as typed.
 *
 * Trailing empties are NOT trimmed. Pressing Enter is how a teacher makes room
 * for the next option, and a control that deleted the row they had just made
 * would take the cursor with it. The empty option then shows up in the paper's
 * checklist as "varianta de pe locul 4 nu are text", which is a sentence they
 * can act on, rather than a control that argues with them while they type.
 */
export const linesToList = (value: string): string[] => value.split("\n");

export const listToLines = (items: readonly string[]): string =>
  items.join("\n");

export function LineListField({
  id,
  label,
  hint,
  items,
  rows = 4,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  items: readonly string[];
  rows?: number;
  placeholder?: string;
  onChange: (items: string[]) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={listToLines(items)}
        placeholder={placeholder}
        onChange={(event) => onChange(linesToList(event.target.value))}
      />
    </Field>
  );
}

export function TextField({
  id,
  label,
  hint,
  value,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

export function LongTextField({
  id,
  label,
  hint,
  value,
  rows = 5,
  placeholder,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: string;
  rows?: number;
  placeholder?: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
    </Field>
  );
}

/**
 * A whole number the teacher types.
 *
 * `type="number"` with a step, not a slider: the values here are counts — how
 * many writing lines, how many columns — and a teacher who wants seven lines
 * wants seven, not "somewhere around seven". An empty field is left empty
 * rather than snapped to the minimum, so the number can be cleared and retyped
 * without the control fighting the second keystroke.
 */
export function CountField({
  id,
  label,
  hint,
  value,
  least,
  most,
  onChange,
}: {
  id: string;
  label: string;
  hint?: string;
  value: number;
  least: number;
  most: number;
  onChange: (value: number) => void;
}) {
  return (
    <Field label={label} htmlFor={id} hint={hint}>
      <Input
        id={id}
        type="number"
        inputMode="numeric"
        min={least}
        max={most}
        value={String(value)}
        onChange={(event) => {
          const parsed = Number(event.target.value);
          if (!Number.isFinite(parsed)) return;
          onChange(Math.min(most, Math.max(least, Math.round(parsed))));
        }}
      />
    </Field>
  );
}

/**
 * One choice out of a list, vertical rather than as a row of pills.
 *
 * The options are the teacher's own words and are routinely a whole sentence —
 * "Cu litere — a) b) c)", or an option copied out of the question itself — so a
 * segmented control would either truncate them or force the rail wider than the
 * paper it sits beside. `ToggleGroup` is the right control for one-word
 * choices; this is the other one.
 *
 * The design system's `RadioGroup` rather than bare `<input type="radio">`: it
 * carries the behaviour that is easy to get wrong and invisible when it is —
 * one tab stop for the whole set, arrow keys between options, a 44px target
 * around a 20px mark, and the `--muted` focus tint that is this product's only
 * focus signal. A hand-rolled row of inputs looked identical and had none of it.
 */
export function PickOne({
  name,
  label,
  hint,
  options,
  value,
  onChange,
}: {
  /** Prefix for the option ids. Generated when a caller has nothing stable. */
  name?: string;
  label: string;
  hint?: string;
  options: readonly { readonly value: string; readonly label: string }[];
  value: string | null;
  onChange: (value: string) => void;
}) {
  const generated = useId();
  const prefix = name ?? generated;
  return (
    <Field label={label} hint={hint}>
      <RadioGroup
        aria-label={label}
        value={value ?? ""}
        onValueChange={onChange}
      >
        {options.map((option) => {
          const id = `${prefix}-${option.value}`;
          return (
            <div key={option.value} className="flex items-center gap-2">
              <RadioGroupItem id={id} value={option.value} />
              <Label
                htmlFor={id}
                className="min-w-0 flex-1 cursor-pointer font-normal"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </RadioGroup>
    </Field>
  );
}

/**
 * The same list, but any number of them may be chosen.
 *
 * Checkboxes, not a multi-select: which options are correct is a set the
 * teacher reads back at a glance while writing the question, and a collapsed
 * multi-select hides exactly that.
 */
export function PickMany({
  name,
  label,
  hint,
  options,
  values,
  onChange,
}: {
  /** Prefix for the option ids. Generated when a caller has nothing stable. */
  name?: string;
  label: string;
  hint?: string;
  options: readonly { readonly value: string; readonly label: string }[];
  values: readonly string[];
  onChange: (values: string[]) => void;
}) {
  const generated = useId();
  const prefix = name ?? generated;
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-1">
        {options.map((option) => {
          const id = `${prefix}-${option.value}`;
          const checked = values.includes(option.value);
          return (
            <div key={option.value} className="flex items-center gap-2">
              <Checkbox
                id={id}
                checked={checked}
                onChange={() =>
                  onChange(
                    checked
                      ? values.filter((one) => one !== option.value)
                      : [...values, option.value],
                  )
                }
              />
              <Label
                htmlFor={id}
                className="min-w-0 flex-1 cursor-pointer font-normal"
              >
                {option.label}
              </Label>
            </div>
          );
        })}
      </div>
    </Field>
  );
}

/**
 * One small choice per row of a list — which right-hand item this left-hand one
 * pairs with, whether this statement is true, which sign goes between these two
 * numbers.
 *
 * A native `<select>` rather than the design system's, because there is one per
 * row and up to ten rows: ten popovers in a 344px rail is ten places focus can
 * get lost, and a native select is one Tab and one arrow key per row.
 */
export function RowChoices({
  label,
  hint,
  rows,
  options,
  values,
  emptyLabel,
  onChange,
}: {
  label: string;
  hint?: string;
  rows: readonly string[];
  options: readonly { readonly value: string; readonly label: string }[];
  values: readonly (string | null)[];
  emptyLabel: string;
  onChange: (values: (string | null)[]) => void;
}) {
  return (
    <Field label={label} hint={hint}>
      <div className="flex flex-col gap-1.5">
        {rows.map((row, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="min-w-0 flex-1 truncate text-base" title={row}>
              {row === "" ? `${index + 1}.` : row}
            </span>
            <select
              aria-label={row === "" ? `${index + 1}.` : row}
              className="h-11 min-w-28 rounded-sm border border-input bg-surface px-2 text-base text-foreground"
              value={values[index] ?? ""}
              onChange={(event) => {
                const next = [...values];
                next[index] =
                  event.target.value === "" ? null : event.target.value;
                onChange(next);
              }}
            >
              <option value="">{emptyLabel}</option>
              {options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </Field>
  );
}
