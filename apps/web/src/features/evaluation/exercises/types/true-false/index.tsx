import {
  TrueFalseAnswer,
  TrueFalseConfig,
  trueFalseExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, RowChoices, TextField } from "../../fields";
import { ItemRow, ItemRows, PaperHint, PaperNote } from "../../paper";

/**
 * Adevărat sau fals — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels, and the two
 * are joined by the `type` string alone.
 *
 * ## The marks go in `ItemRow`'s trailing slot, not its label
 *
 * Every other type's row is a non-shrinking label then the text. This one is
 * its mirror image — the statement takes the measure and the pair of marks sits
 * hard right, so a pupil's pencil finds them in the same place on every line.
 * Passing them as the `label` would print „A / F Pisica are patru labe."; the
 * trailing slot exists for exactly this shape and keeps the gap between the
 * words and the marks the same number every other row on the sheet uses.
 *
 * ## `compact` asks `ItemRows` for two columns rather than for wrapping
 *
 * `ItemRows` reads `compact` as flex-wrap, which packs children by their
 * content width. Statements are sentences of unequal length, so that gives
 * three on one line and one on the next, and the column of A/F pairs — the one
 * thing a pupil scans down — disappears. The layout promises a shorter
 * exercise, not a ragged one, so this type asks for the `two-column` grid.
 *
 * ## The marks are printed, never circled
 *
 * Both modes draw the same bare pair. Which one is right lives on the barem,
 * written by `describeAnswer` and printed on a different sheet; a preview that
 * ringed the correct letter would be a preview of a document nobody holds.
 */

const COPY = {
  statements: "Enunțurile",
  statementsHint: "Câte un enunț pe rând.",
  trueMark: "Semnul pentru adevărat",
  trueMarkHint: "Ce încercuiește elevul. De obicei A.",
  falseMark: "Semnul pentru fals",
  falseMarkHint: "De obicei F.",
  correct: "Cum este fiecare enunț",
  correctHint: "Se tipărește numai în barem, niciodată pe foaia elevului.",
  correctTrue: "Adevărat",
  correctFalse: "Fals",
} as const;

/** Wide enough that the marks read as a column rather than as a suffix. */
const GAP_MM = 3;

export const definition = trueFalseExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = TrueFalseConfig.safeParse(config);
  const current = parsed.success ? parsed.data : null;

  if (current === null || current.statements.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <ItemRows layoutId={layoutId === "compact" ? "two-column" : layoutId}>
      {current.statements.map((statement, index) => (
        <ItemRow
          key={index}
          gapMm={GAP_MM}
          trailing={
            <>
              {current.trueMark} <PaperNote theme={theme}>/</PaperNote>{" "}
              {current.falseMark}
            </>
          }
        >
          {statement.trim() === "" && mode === "edit" ? (
            <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
          ) : (
            statement
          )}
        </ItemRow>
      ))}
    </ItemRows>
  );
}

/**
 * The barem grows and shrinks with the list, keeping every choice already made.
 *
 * A statement added at the end arrives marked „Fals" rather than unmarked,
 * because the answer is a list of booleans and has no third state to store. The
 * teacher sees it in the panel on the row they have just created, which is the
 * cheapest place for a wrong default to be noticed.
 */
const resize = (values: readonly boolean[], length: number): boolean[] =>
  Array.from({ length }, (_, index) => values[index] ?? false);

/**
 * The rows decided so far, up to the last one the teacher answered.
 *
 * A row left at „—" cannot be stored — there are two booleans and no third —
 * so the answer keeps the decided prefix and the paper's checklist says the
 * barem has not got one answer per statement yet. Truncating is what makes that
 * sentence true; padding the tail would hide the gap behind a „Fals" nobody
 * chose. A row skipped in the middle does get that „Fals", and it is visible in
 * the panel next to the rows around it.
 */
const decidedPrefix = (
  chosen: readonly (string | null)[],
): boolean[] | null => {
  const last = chosen.reduce(
    (found, value, index) => (value === null ? found : index),
    -1,
  );
  return last < 0
    ? null
    : chosen.slice(0, last + 1).map((value) => value === "true");
};

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = TrueFalseConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : trueFalseExercise.defaults;

  const parsedAnswer = TrueFalseAnswer.safeParse(answer);
  const values = parsedAnswer.success ? parsedAnswer.data.values : null;

  const emit = (
    nextConfig: typeof current,
    nextValues: readonly boolean[] | null,
  ): void =>
    onChange({
      config: nextConfig,
      answer: nextValues === null ? null : { values: [...nextValues] },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LineListField
          id={`${idPrefix}-statements`}
          label={COPY.statements}
          hint={COPY.statementsHint}
          items={current.statements}
          onChange={(statements) =>
            emit(
              { ...current, statements },
              values === null ? null : resize(values, statements.length),
            )
          }
        />

        <TextField
          id={`${idPrefix}-true-mark`}
          label={COPY.trueMark}
          hint={COPY.trueMarkHint}
          value={current.trueMark}
          onChange={(trueMark) => emit({ ...current, trueMark }, values)}
        />

        <TextField
          id={`${idPrefix}-false-mark`}
          label={COPY.falseMark}
          hint={COPY.falseMarkHint}
          value={current.falseMark}
          onChange={(falseMark) => emit({ ...current, falseMark }, values)}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <RowChoices
          label={COPY.correct}
          hint={COPY.correctHint}
          rows={current.statements}
          options={[
            { value: "true", label: COPY.correctTrue },
            { value: "false", label: COPY.correctFalse },
          ]}
          values={current.statements.map((_statement, index) => {
            const value = values?.[index];
            return value === undefined ? null : value ? "true" : "false";
          })}
          emptyLabel={EVALUATION_COPY.answerNotChosen}
          onChange={(chosen) => emit(current, decidedPrefix(chosen))}
        />
      </FieldGroup>
    </>
  );
}
