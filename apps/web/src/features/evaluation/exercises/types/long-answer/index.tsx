import {
  LongAnswerAnswer,
  LongAnswerConfig,
  longAnswerExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { CountField, FieldGroup, LineListField } from "../../fields";
import { ItemRow, ItemRows, PaperHint, WritingLines } from "../../paper";

/**
 * Compunere — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels. The two are
 * joined by the `type` string and by nothing else, which is what lets the API
 * and the PDF worker import the first without importing React.
 *
 * ## The reminders print, the criteria never do
 *
 * Both halves of this type are lists of short sentences, and they go to
 * different sheets: `config.reminders` is drawn here, above the ruled lines,
 * where the pupil reads it while writing; `answer.criteria` is drawn nowhere in
 * this file at all. That asymmetry is the whole reason the barem is a separate
 * field, and it is easiest to break in a type where both lists look alike — so
 * the criteria are not imported into `Body` even to be conditionally hidden.
 *
 * ## A blank reminder still prints its bullet
 *
 * In `preview` a reminder with no text is drawn as a lone "•", because that is
 * exactly what the printer will produce. Hiding it would give the teacher a
 * tidy preview of a document that does not exist, and it would also move every
 * reminder below it up a place — so "cerința de pe locul 2 nu are text", the
 * sentence the paper's own checklist says, would point at the wrong row.
 */

const COPY = {
  lines: "Câte rânduri are compunerea",
  linesHint: "Rândurile pe care scrie elevul.",
  reminders: "Ce trebuie să cuprindă",
  remindersHint: "Câte o cerință pe rând. Se tipăresc sub cerință.",
  criteria: "Ce urmărești la corectare",
  criteriaHint: "Se tipăresc numai în barem, niciodată pe foaia elevului.",
} as const;

/** The mark before a reminder. A bullet, because the order carries nothing. */
const BULLET = "•";

export const definition = longAnswerExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = LongAnswerConfig.safeParse(config);
  if (!parsed.success) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const { lines, reminders } = parsed.data;
  const anyWritten = reminders.some((one) => one.trim() !== "");

  return (
    <>
      {anyWritten ? (
        <ItemRows layoutId={layoutId} gapMm={1}>
          {reminders.map((reminder, index) => (
            <ItemRow key={index} label={BULLET} gapMm={1.4}>
              {reminder.trim() === "" && mode === "edit" ? (
                <PaperHint theme={theme}>
                  {EVALUATION_COPY.emptyTextHint}
                </PaperHint>
              ) : (
                reminder
              )}
            </ItemRow>
          ))}
        </ItemRows>
      ) : null}

      <WritingLines theme={theme} count={lines} />
    </>
  );
}

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = LongAnswerConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : longAnswerExercise.defaults;

  const parsedAnswer = LongAnswerAnswer.safeParse(answer);
  const criteria = parsedAnswer.success ? parsedAnswer.data.criteria : [];

  /**
   * The barem is never cleared from here.
   *
   * `answer: null` is for a change that STRANDS the answer — shortening a list
   * the barem points into. Nothing in this type points into anything: the
   * criteria are free text that stays true whatever the line count becomes. So
   * both halves are written on every edit, and an all-blank list is reported in
   * words by the paper's checklist rather than being silently thrown away while
   * the teacher is still typing it.
   */
  const emit = (
    nextConfig: typeof current,
    nextCriteria: readonly string[],
  ): void =>
    onChange({ config: nextConfig, answer: { criteria: nextCriteria } });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <CountField
          id={`${idPrefix}-lines`}
          label={COPY.lines}
          hint={COPY.linesHint}
          value={current.lines}
          least={4}
          most={40}
          onChange={(lines) => emit({ ...current, lines }, criteria)}
        />

        <LineListField
          id={`${idPrefix}-reminders`}
          label={COPY.reminders}
          hint={COPY.remindersHint}
          items={current.reminders}
          rows={3}
          onChange={(reminders) => emit({ ...current, reminders }, criteria)}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <LineListField
          id={`${idPrefix}-criteria`}
          label={COPY.criteria}
          hint={COPY.criteriaHint}
          items={criteria}
          onChange={(next) => emit(current, next)}
        />
      </FieldGroup>
    </>
  );
}
