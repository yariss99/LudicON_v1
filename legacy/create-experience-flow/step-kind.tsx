import { Check } from "lucide-react";
import { cn } from "@ludicon/ui";

import { FieldNote } from "./field-note";
import { firstMessage, KindSchema } from "./flow-form";
import { MATERIAL_KINDS, type MaterialKind } from "./material-kinds";
import type { CreateFlowForm } from "./use-create-flow";

export interface StepKindProps {
  form: CreateFlowForm;
  onChoose: (kind: MaterialKind) => void;
}

const CARD_CLASS = [
  "flex h-full min-h-11 w-full flex-col gap-1.5 rounded-md bg-card p-5",
  "shadow-soft ring-1 ring-border",
  "transition-[box-shadow,transform,background-color,--tw-ring-color]",
  "duration-[var(--motion-standard)] ease-standard",
  "group-hover:-translate-y-[var(--motion-hover-y)] group-hover:shadow-hover",
  // Chosen: a soft fill, a heavier ring AND a check — never the fill alone.
  "peer-checked:bg-primary-soft peer-checked:ring-2 peer-checked:ring-primary",
  // Keyboard focus lifts the card and detaches its ring, rather than tinting
  // it. The real radio is visually hidden and cannot show focus itself, and
  // fill and ring colour are already spoken for by "chosen" — a focus style
  // that reused either of them would win the cascade and hide the choice.
  "peer-focus-visible:shadow-hover",
  "peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-background",
].join(" ");

/**
 * Step 1 — what the teacher wants to make.
 *
 * Real radio inputs under the cards, not buttons pretending to be a group:
 * that is what gives arrow-key movement, a single tab stop and the right
 * announcement for free. Every entry the create menu offers appears here, in
 * the menu's own order, so the two ways in never disagree.
 */
export function StepKind({ form, onChoose }: StepKindProps) {
  return (
    <form.Field name="kind" validators={{ onDynamic: KindSchema }}>
      {(field) => {
        const message = firstMessage(field.state.meta.errors);
        const noteId = `${field.name}-note`;

        return (
          <fieldset className="flex flex-col gap-4">
            <legend className="sr-only">Ce vrei să pregătești?</legend>

            <div className="grid gap-4 sm:grid-cols-2 laptop:grid-cols-3">
              {MATERIAL_KINDS.map((option) => {
                const Icon = option.icon;
                const chosen = field.state.value === option.kind;

                return (
                  <label
                    key={option.kind}
                    className="group flex cursor-pointer"
                    data-chosen={chosen || undefined}
                  >
                    <input
                      type="radio"
                      className="peer sr-only"
                      name={field.name}
                      value={option.kind}
                      checked={chosen}
                      aria-describedby={message ? noteId : undefined}
                      onChange={() => {
                        field.handleChange(option.kind);
                        onChoose(option.kind);
                      }}
                      onBlur={field.handleBlur}
                      data-autofocus={chosen ? "" : undefined}
                    />
                    <span className={CARD_CLASS}>
                      <span className="flex items-center justify-between gap-2">
                        <Icon
                          aria-hidden
                          strokeWidth={1.75}
                          className={cn(
                            "size-6 transition-colors duration-[var(--motion-standard)] ease-standard",
                            chosen ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        {chosen ? (
                          <Check
                            aria-hidden
                            strokeWidth={1.75}
                            className="size-5 text-primary"
                          />
                        ) : null}
                      </span>
                      <span className="text-[1.0625rem] leading-[1.4] font-semibold text-strong">
                        {option.label}
                      </span>
                      <span className="text-[0.9375rem] leading-[1.5] text-muted-foreground">
                        {option.description}
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {message ? <FieldNote id={noteId}>{message}</FieldNote> : null}
          </fieldset>
        );
      }}
    </form.Field>
  );
}
