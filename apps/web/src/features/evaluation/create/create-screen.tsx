import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { revalidateLogic, useForm } from "@tanstack/react-form";
import {
  Discipline,
  DISCIPLINE_LABEL,
  GRADE_LEVEL_LABEL,
  GradeLevel,
} from "@ludicon/domain";
import type { EvaluationProject } from "@ludicon/evaluation";
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Textarea,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import {
  CREATE_DEFAULTS,
  DescriptionSchema,
  DisciplineSchema,
  DurationSchema,
  firstMessage,
  GradeSchema,
  TitleSchema,
} from "./create-form";
import { createPaper } from "./create-paper";

/**
 * Five questions, then the page.
 *
 * The form asks only what the library needs to file the paper and what the
 * cover needs to print: everything else about an evaluation is decided on the
 * page itself, where the teacher can see it. A longer intake would be a wizard
 * standing between someone and the thing they came to make.
 *
 * `revalidateLogic({ mode: "blur", modeAfterSubmission: "change" })` is what
 * keeps the screen quiet — nothing is checked while a word is half-typed, only
 * on leaving a field or on trying to move on, and after that first attempt
 * corrections clear as they are made. Validators are keyed `onDynamic`, which
 * is the key that logic reads.
 *
 * The two Selects render `DISCIPLINE_LABEL` and `GRADE_LEVEL_LABEL`, never the
 * enum value. `clasa_3` is a database row, not a class, and showing it is a
 * live bug elsewhere in this app.
 */

export interface CreateScreenProps {
  onCreated: (paper: EvaluationProject) => void;
}

export function CreateScreen({ onCreated }: CreateScreenProps) {
  const [failed, setFailed] = useState(false);

  const form = useForm({
    defaultValues: CREATE_DEFAULTS,
    validationLogic: revalidateLogic({
      mode: "blur",
      modeAfterSubmission: "change",
    }),
    onSubmit: async ({ value }) => {
      setFailed(false);
      try {
        onCreated(
          await createPaper({
            title: value.title,
            description: value.description,
            discipline: Discipline.parse(value.discipline),
            grade: GradeLevel.parse(value.grade),
            durationMinutes: value.durationMinutes,
          }),
        );
      } catch {
        setFailed(true);
      }
    },
  });

  return (
    <main
      id="continut"
      className="mx-auto flex min-h-svh w-full max-w-2xl flex-col justify-center px-6 py-16"
    >
      <h1 className="font-display text-3xl leading-tight font-semibold text-foreground">
        {EVALUATION_COPY.createTitle}
      </h1>
      <p className="mt-2 text-lg leading-[1.5] text-muted-foreground">
        {EVALUATION_COPY.createLead}
      </p>

      <form
        noValidate
        className="mt-8 grid gap-5 sm:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <div className="sm:col-span-2">
          <form.Field name="title" validators={{ onDynamic: TitleSchema }}>
            {(field) => {
              const message = firstMessage(field.state.meta.errors);
              return (
                <FieldShell
                  htmlFor={field.name}
                  label={EVALUATION_COPY.fieldTitle}
                  message={message}
                >
                  <Input
                    id={field.name}
                    name={field.name}
                    autoFocus
                    autoComplete="off"
                    placeholder={EVALUATION_COPY.fieldTitlePlaceholder}
                    aria-invalid={message ? true : undefined}
                    aria-describedby={
                      message ? `${field.name}-note` : undefined
                    }
                    value={field.state.value}
                    onChange={(event) => field.handleChange(event.target.value)}
                    onBlur={field.handleBlur}
                  />
                </FieldShell>
              );
            }}
          </form.Field>
        </div>

        <div className="sm:col-span-2">
          <form.Field
            name="description"
            validators={{ onDynamic: DescriptionSchema }}
          >
            {(field) => (
              <FieldShell
                htmlFor={field.name}
                label={EVALUATION_COPY.fieldDescription}
                message={firstMessage(field.state.meta.errors)}
              >
                <Textarea
                  id={field.name}
                  name={field.name}
                  rows={3}
                  placeholder={EVALUATION_COPY.fieldDescriptionPlaceholder}
                  value={field.state.value}
                  onChange={(event) => field.handleChange(event.target.value)}
                  onBlur={field.handleBlur}
                />
              </FieldShell>
            )}
          </form.Field>
        </div>

        <form.Field
          name="discipline"
          validators={{ onDynamic: DisciplineSchema }}
        >
          {(field) => {
            const message = firstMessage(field.state.meta.errors);
            return (
              <FieldShell
                htmlFor={field.name}
                label={EVALUATION_COPY.fieldDiscipline}
                message={message}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(next) => {
                    const parsed = Discipline.safeParse(next);
                    if (parsed.success) field.handleChange(parsed.data);
                  }}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full cursor-pointer"
                    aria-invalid={message ? true : undefined}
                  >
                    <SelectValue
                      placeholder={EVALUATION_COPY.choosePlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {Discipline.options.map((value) => (
                      <SelectItem key={value} value={value}>
                        {DISCIPLINE_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            );
          }}
        </form.Field>

        <form.Field name="grade" validators={{ onDynamic: GradeSchema }}>
          {(field) => {
            const message = firstMessage(field.state.meta.errors);
            return (
              <FieldShell
                htmlFor={field.name}
                label={EVALUATION_COPY.fieldGrade}
                message={message}
              >
                <Select
                  value={field.state.value}
                  onValueChange={(next) => {
                    const parsed = GradeLevel.safeParse(next);
                    if (parsed.success) field.handleChange(parsed.data);
                  }}
                >
                  <SelectTrigger
                    id={field.name}
                    className="w-full cursor-pointer"
                    aria-invalid={message ? true : undefined}
                  >
                    <SelectValue
                      placeholder={EVALUATION_COPY.choosePlaceholder}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {GradeLevel.options.map((value) => (
                      <SelectItem key={value} value={value}>
                        {GRADE_LEVEL_LABEL[value]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldShell>
            );
          }}
        </form.Field>

        <form.Field
          name="durationMinutes"
          validators={{ onDynamic: DurationSchema }}
        >
          {(field) => {
            const message = firstMessage(field.state.meta.errors);
            return (
              <FieldShell
                htmlFor={field.name}
                label={EVALUATION_COPY.fieldDuration}
                message={message}
              >
                <div className="flex items-center gap-2">
                  <Input
                    id={field.name}
                    name={field.name}
                    type="number"
                    inputMode="numeric"
                    min={5}
                    max={240}
                    className="max-w-28"
                    aria-invalid={message ? true : undefined}
                    value={field.state.value}
                    onChange={(event) =>
                      field.handleChange(Number(event.target.value))
                    }
                    onBlur={field.handleBlur}
                  />
                  <span className="text-muted-foreground">
                    {EVALUATION_COPY.fieldDurationUnit}
                  </span>
                </div>
              </FieldShell>
            );
          }}
        </form.Field>

        {failed ? (
          <p role="alert" className="sm:col-span-2 text-muted-foreground">
            {EVALUATION_COPY.createFailed}
          </p>
        ) : null}

        <div className="mt-2 flex flex-wrap items-center gap-3 sm:col-span-2">
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(submitting) => (
              <Button type="submit" variant="primary" disabled={submitting}>
                {EVALUATION_COPY.createSubmit}
              </Button>
            )}
          </form.Subscribe>

          <Button variant="ghost" asChild>
            <Link to="/projects">{EVALUATION_COPY.createCancel}</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}

/**
 * Label, control, and the one remark about it.
 *
 * The remark is `role="status"` rather than `role="alert"`: it appears while
 * the teacher is filling a form they are already looking at, and an assertive
 * announcement would interrupt them mid-field to say something they can see.
 */
function FieldShell({
  htmlFor,
  label,
  message,
  children,
}: {
  htmlFor: string;
  label: string;
  message?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {message ? (
        <p
          id={`${htmlFor}-note`}
          role="status"
          className="text-sm text-muted-foreground"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
