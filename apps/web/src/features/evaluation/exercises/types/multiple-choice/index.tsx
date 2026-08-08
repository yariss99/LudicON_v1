import {
  MultipleChoiceAnswer,
  MultipleChoiceConfig,
  MultipleChoiceMarker,
  multipleChoiceExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, PickMany, PickOne } from "../../fields";
import {
  ItemRow,
  ItemRows,
  optionLabel,
  PaperHint,
  TickBox,
} from "../../paper";

/**
 * Alegere cu mai multe răspunsuri — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels. The two are
 * joined by the `type` string and by nothing else, which is what lets the API
 * and the PDF worker import the first without importing React.
 *
 * ## The tick box belongs to the label, not to a column of its own
 *
 * `ItemRow` draws one non-shrinking label and one flexible body, so the box and
 * the "a)" go together into the label and the variant's text takes the rest.
 * The rejected arrangement was a two-column grid of boxes and texts: it looks
 * identical until a variant wraps, at which point the box drifts to the middle
 * of the second line instead of sitting beside the first, and it stops the
 * `two-column` and `grid` layouts from nesting because the inner grid cannot
 * share the outer one's tracks.
 *
 * ## The variants are written once and ticked separately
 *
 * They are typed as lines in one textarea under „Întrebarea" and listed again
 * as checkboxes under „Baremul". The repetition is deliberate: those two groups
 * end up on two different sheets, and a tick sitting beside the text as it is
 * typed is the first step towards storing the answer alongside what the pupil
 * receives.
 *
 * ## Nothing is ticked on the paper
 *
 * `Body` draws empty boxes in both modes, because `preview` has to be exactly
 * what the printer produces and what the printer produces is the pupil's sheet.
 * The right answers are read from `describeAnswer` onto the barem, which is a
 * separate printout.
 */

const COPY = {
  options: "Variantele",
  optionsHint: "Câte o variantă pe rând.",
  marker: "Cum sunt numerotate",
  markerLetters: "Cu litere — a) b) c)",
  markerNumbers: "Cu cifre — 1. 2. 3.",
  correct: "Variantele corecte",
  correctHint: "Bifează-le pe toate. Se tipăresc numai în barem.",
} as const;

export const definition = multipleChoiceExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = MultipleChoiceConfig.safeParse(config);
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
        <ItemRow
          key={index}
          label={
            <>
              <TickBox theme={theme} /> {optionLabel(index, marker)}
            </>
          }
        >
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
  const parsedConfig = MultipleChoiceConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : multipleChoiceExercise.defaults;

  const parsedAnswer = MultipleChoiceAnswer.safeParse(answer);
  const correct = parsedAnswer.success ? parsedAnswer.data.correct : [];

  const emit = (
    nextConfig: typeof current,
    nextCorrect: readonly number[],
  ): void =>
    onChange({
      config: nextConfig,
      answer: nextCorrect.length === 0 ? null : { correct: [...nextCorrect] },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        {/**
         * Shortening the list can strand a ticked position past the end of it,
         * so the barem is re-checked in the same call that writes the options.
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
              correct.filter((index) => index < options.length),
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
            const marker = MultipleChoiceMarker.safeParse(value);
            if (marker.success)
              emit({ ...current, marker: marker.data }, correct);
          }}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <PickMany
          label={COPY.correct}
          hint={COPY.correctHint}
          options={current.options.map((option, index) => ({
            value: String(index),
            label:
              option.trim() === ""
                ? optionLabel(index, current.marker)
                : `${optionLabel(index, current.marker)} ${option}`,
          }))}
          values={correct.map(String)}
          onChange={(values) =>
            /* Sorted, so the barem row reads down the question rather than in
               the order the boxes happened to be ticked. */
            emit(
              current,
              values.map(Number).sort((first, second) => first - second),
            )
          }
        />
      </FieldGroup>
    </>
  );
}
