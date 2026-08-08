import { Label, Textarea } from "@ludicon/ui";

import { FieldNote } from "./field-note";
import { DescriptionSchema, firstMessage } from "./flow-form";
import { kindFieldLabel, kindPlaceholder } from "./material-kinds";
import type { CreateFlowForm } from "./use-create-flow";

export interface StepIntentProps {
  form: CreateFlowForm;
}

/**
 * Step 2 — the teacher's own words.
 *
 * The one place in the flow that is genuinely open: one label, one field, no
 * structure imposed on the sentence. Everything the platform needs beyond it
 * is read from here and shown back on the next step for correction, which is
 * the opposite of asking the teacher to fill a form first.
 */
export function StepIntent({ form }: StepIntentProps) {
  return (
    <form.Subscribe selector={(state) => state.values.kind}>
      {(kind) => (
        <form.Field
          name="description"
          validators={{ onDynamic: DescriptionSchema }}
          // Nothing is checked while the first words are still being typed.
          // Once something has been said, though, it stops being said the
          // moment it is put right — waiting for the next blur to take back a
          // remark the teacher already acted on is how a form nags.
          listeners={{
            onChange: ({ fieldApi }) => {
              if (fieldApi.state.meta.errors.length > 0) {
                void fieldApi.validate("blur");
              }
            },
          }}
        >
          {(field) => {
            const message = firstMessage(field.state.meta.errors);
            const noteId = `${field.name}-note`;
            const hintId = `${field.name}-hint`;

            return (
              <div className="flex flex-col gap-2.5">
                <Label htmlFor={field.name}>{kindFieldLabel(kind)}</Label>
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={6}
                  // Focus is handed over by the flow, one frame after the step
                  // settles — `autoFocus` would grab it first and drop the
                  // cursor in front of the opening phrase.
                  data-autofocus=""
                  aria-invalid={message ? true : undefined}
                  aria-describedby={message ? `${noteId} ${hintId}` : hintId}
                  className="text-[1.0625rem] leading-[1.6] aria-invalid:ring-accent"
                  placeholder={kindPlaceholder(kind)}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
                {message ? <FieldNote id={noteId}>{message}</FieldNote> : null}
                <p
                  id={hintId}
                  className="text-[0.9375rem] leading-[1.5] text-muted-foreground"
                >
                  Scrie cât vrei. Ce nu spui acum, limpezim împreună mai târziu.
                </p>
              </div>
            );
          }}
        </form.Field>
      )}
    </form.Subscribe>
  );
}
