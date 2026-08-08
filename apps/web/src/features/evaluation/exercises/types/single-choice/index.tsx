import {
  SingleChoiceAnswer,
  SingleChoiceConfig,
  SingleChoiceMarker,
  singleChoiceExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, PickOne } from "../../fields";
import { ItemRow, ItemRows, optionLabel, PaperHint } from "../../paper";

/**
 * Alegere cu un răspuns — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels. The two are
 * joined by the `type` string and by nothing else, which is what lets the API
 * and the PDF worker import the first without importing React.
 *
 * ## `Body` parses, and draws a hint if it cannot
 *
 * `config` arrives as `unknown` because the document model keeps it opaque —
 * that is what makes a new exercise type ship without bumping the document
 * schema. So the first thing here is a `safeParse`, and a failure draws the
 * same hint an unwritten question draws rather than throwing. A canvas that
 * crashes on one malformed block takes the whole paper with it, including the
 * eleven questions that were fine.
 *
 * ## Empty options still print their letter
 *
 * In `preview` an option with no text is drawn as "b)" and nothing else,
 * because that is exactly what the printer will produce. The temptation is to
 * hide it and show a tidy paper; the preview would then be a different document
 * from the one in the teacher's hand. The paper's checklist is where "varianta
 * de pe locul 2 nu are text" gets said.
 */

const COPY = {
  options: "Variantele",
  optionsHint: "Câte o variantă pe rând.",
  marker: "Cum sunt numerotate",
  markerLetters: "Cu litere — a) b) c)",
  markerNumbers: "Cu cifre — 1. 2. 3.",
  correct: "Varianta corectă",
  correctHint: "Se tipărește numai în barem, niciodată pe foaia elevului.",
} as const;

export const definition = singleChoiceExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = SingleChoiceConfig.safeParse(config);
  const options = parsed.success ? parsed.data.options : [];
  const marker = parsed.success ? parsed.data.marker : "letters";

  if (options.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <ItemRows layoutId={layoutId}>
      {options.map((option, index) => (
        <ItemRow key={index} label={optionLabel(index, marker)}>
          {option.trim() === "" && mode === "edit" ? (
            <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
          ) : (
            option
          )}
        </ItemRow>
      ))}
    </ItemRows>
  );
}

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = SingleChoiceConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : singleChoiceExercise.defaults;

  const parsedAnswer = SingleChoiceAnswer.safeParse(answer);
  const correct = parsedAnswer.success ? parsedAnswer.data.correct : null;

  const emit = (nextConfig: typeof current, nextCorrect: number | null): void =>
    onChange({
      config: nextConfig,
      answer: nextCorrect === null ? null : { correct: nextCorrect },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        {/**
         * Shortening the list can strand the barem past the end of it, so the
         * chosen answer is re-checked in the same call that writes the options.
         * `exercise-actions.ts` makes the pair one step of undo; this is the
         * half that decides what the pair should be.
         */}
        <LineListField
          id={`${idPrefix}-options`}
          label={COPY.options}
          hint={COPY.optionsHint}
          items={current.options}
          onChange={(options) =>
            emit(
              { ...current, options },
              correct !== null && correct < options.length ? correct : null,
            )
          }
        />

        <PickOne
          name={`${idPrefix}-marker`}
          label={COPY.marker}
          options={[
            { value: "letters", label: COPY.markerLetters },
            { value: "numbers", label: COPY.markerNumbers },
          ]}
          value={current.marker}
          onChange={(value) => {
            const marker = SingleChoiceMarker.safeParse(value);
            if (marker.success)
              emit({ ...current, marker: marker.data }, correct);
          }}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <PickOne
          name={`${idPrefix}-correct`}
          label={COPY.correct}
          hint={COPY.correctHint}
          options={current.options.map((option, index) => ({
            value: String(index),
            label:
              option.trim() === ""
                ? optionLabel(index, current.marker)
                : `${optionLabel(index, current.marker)} ${option}`,
          }))}
          value={correct === null ? null : String(correct)}
          onChange={(value) => emit(current, Number(value))}
        />
      </FieldGroup>
    </>
  );
}
