import { useId, useState, type ReactNode } from "react";
import { ArrowDown, ArrowUp, Plus, X } from "lucide-react";
import { Button, Input, Label } from "@ludicon/ui";

import { COPY } from "../copy";

export type StringListEditorProps = {
  label: string;
  /** One line explaining what belongs in the list. Always visible. */
  hint?: string;
  items: readonly string[];
  onChange: (next: readonly string[]) => void;
  placeholder?: string;
  /** Verb for the add button, e.g. "Adaugă un obiectiv". */
  addLabel?: string;
};

/**
 * The list editor, written once.
 *
 * Five literal copies of this component existed — one per builder, 99%
 * identical. Reordering is buttons-only by design: CH07 requires a keyboard and
 * pointer alternative to any drag gesture, and a list this short does not earn
 * the drag affordance in the first place.
 */
export function StringListEditor({
  label,
  hint,
  items,
  onChange,
  placeholder,
  addLabel,
}: StringListEditorProps) {
  const [pending, setPending] = useState("");
  const fieldId = useId();

  const add = () => {
    const value = pending.trim();
    if (value.length === 0) return;
    onChange([...items, value]);
    setPending("");
  };

  const replace = (index: number, value: string) =>
    onChange(
      items.map((item, position) => (position === index ? value : item)),
    );

  const remove = (index: number) =>
    onChange(items.filter((_, position) => position !== index));

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    const moved = next[index];
    const displaced = next[target];
    if (moved === undefined || displaced === undefined) return;
    next[index] = displaced;
    next[target] = moved;
    onChange(next);
  };

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className="text-sm font-medium text-strong">{label}</legend>
      {hint ? <p className="text-sm text-muted-foreground">{hint}</p> : null}

      {items.length === 0 ? (
        <p className="text-sm text-subtle">{COPY.emptyList}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => (
            <li key={`${fieldId}-${index}`} className="flex items-center gap-2">
              <Label className="sr-only" htmlFor={`${fieldId}-item-${index}`}>
                {`${label} ${index + 1}`}
              </Label>
              <Input
                id={`${fieldId}-item-${index}`}
                value={item}
                onChange={(event) => replace(index, event.target.value)}
                className="flex-1"
              />
              <div className="flex shrink-0 items-center gap-1">
                <IconButton
                  label={COPY.moveUp}
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp aria-hidden size={18} strokeWidth={1.75} />
                </IconButton>
                <IconButton
                  label={COPY.moveDown}
                  disabled={index === items.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown aria-hidden size={18} strokeWidth={1.75} />
                </IconButton>
                <IconButton
                  label={COPY.removeItem}
                  onClick={() => remove(index)}
                >
                  <X aria-hidden size={18} strokeWidth={1.75} />
                </IconButton>
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className="flex items-center gap-2">
        <Label className="sr-only" htmlFor={`${fieldId}-new`}>
          {addLabel ?? COPY.addItem}
        </Label>
        <Input
          id={`${fieldId}-new`}
          value={pending}
          placeholder={placeholder}
          onChange={(event) => setPending(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add();
          }}
          className="flex-1"
        />
        <Button
          type="button"
          variant="secondary"
          onClick={add}
          disabled={pending.trim().length === 0}
          className="shrink-0"
        >
          <Plus aria-hidden size={18} strokeWidth={1.75} />
          {addLabel ?? COPY.addItem}
        </Button>
      </div>
    </fieldset>
  );
}

function IconButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="w-11 px-0"
    >
      {children}
    </Button>
  );
}
