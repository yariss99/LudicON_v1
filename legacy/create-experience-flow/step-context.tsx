import { GradeLevel, GRADE_LEVEL_LABEL } from "@ludicon/domain";
import {
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ludicon/ui";

import { ContextField } from "./context-field";
import { DurationSchema, firstMessage, SubjectSchema } from "./flow-form";
import { DURATION_CHOICES, readIntent } from "./read-intent";
import type { CreateFlowForm } from "./use-create-flow";

export interface StepContextProps {
  form: CreateFlowForm;
}

/** Romanian takes "de minute" from twenty upward; every choice here is above it. */
const durationLabel = (minutes: number): string => `${minutes} de minute`;

/** The offered durations, plus whatever was read from the text if it differs. */
function durationOptions(current: number): readonly number[] {
  if (DURATION_CHOICES.includes(current)) return DURATION_CHOICES;
  return [...DURATION_CHOICES, current].sort((a, b) => a - b);
}

/**
 * Step 3 — what was understood, shown back for correction.
 *
 * Nothing here is a question the teacher has not already answered in their
 * own sentence; the fields arrive filled and marked as read rather than blank
 * and demanding. The mark disappears the moment a value is edited, so the
 * teacher can always tell their own choices from ours — and it never appears
 * over a value that was merely a sensible default.
 */
export function StepContext({ form }: StepContextProps) {
  return (
    <form.Subscribe selector={(state) => state.values.description}>
      {(description) => {
        const reading = readIntent(description);

        return (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <form.Field
                name="subject"
                validators={{ onDynamic: SubjectSchema }}
                // A remark the teacher has already acted on stops being made,
                // rather than waiting for the next blur to take itself back.
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
                  return (
                    <ContextField
                      htmlFor={field.name}
                      label="Disciplina"
                      inferred={
                        !field.state.meta.isDirty &&
                        field.state.value.length > 0
                      }
                      note={message}
                      noteId={noteId}
                    >
                      <Input
                        id={field.name}
                        name={field.name}
                        data-autofocus=""
                        autoComplete="off"
                        placeholder="De exemplu: Matematică"
                        aria-invalid={message ? true : undefined}
                        aria-describedby={message ? noteId : undefined}
                        className="aria-invalid:ring-accent"
                        value={field.state.value}
                        onChange={(event) =>
                          field.handleChange(event.target.value)
                        }
                        onBlur={field.handleBlur}
                      />
                    </ContextField>
                  );
                }}
              </form.Field>
            </div>

            <form.Field name="grade">
              {(field) => (
                <ContextField
                  htmlFor={field.name}
                  label="Clasa"
                  inferred={!field.state.meta.isDirty && reading.grade !== null}
                  noteId={`${field.name}-note`}
                >
                  <Select
                    value={field.state.value}
                    onValueChange={(next) => {
                      const parsed = GradeLevel.safeParse(next);
                      if (parsed.success) field.handleChange(parsed.data);
                    }}
                  >
                    <SelectTrigger id={field.name} className="cursor-pointer">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {GradeLevel.options.map((grade) => (
                        <SelectItem key={grade} value={grade}>
                          {GRADE_LEVEL_LABEL[grade]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </ContextField>
              )}
            </form.Field>

            <form.Field
              name="durationMinutes"
              validators={{ onDynamic: DurationSchema }}
            >
              {(field) => {
                const message = firstMessage(field.state.meta.errors);
                const noteId = `${field.name}-note`;
                return (
                  <ContextField
                    htmlFor={field.name}
                    label="Cât durează"
                    inferred={
                      !field.state.meta.isDirty &&
                      reading.durationMinutes !== null
                    }
                    note={message}
                    noteId={noteId}
                  >
                    <Select
                      value={String(field.state.value)}
                      onValueChange={(next) => {
                        const parsed = Number.parseInt(next, 10);
                        if (Number.isFinite(parsed)) field.handleChange(parsed);
                      }}
                    >
                      <SelectTrigger
                        id={field.name}
                        className="cursor-pointer"
                        aria-describedby={message ? noteId : undefined}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {durationOptions(field.state.value).map((minutes) => (
                          <SelectItem key={minutes} value={String(minutes)}>
                            {durationLabel(minutes)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </ContextField>
                );
              }}
            </form.Field>
          </div>
        );
      }}
    </form.Subscribe>
  );
}
