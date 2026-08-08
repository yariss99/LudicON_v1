import {
  FractionsAnswer,
  FractionsConfig,
  fractionsExercise,
  resolveColor,
  type Theme,
} from "@ludicon/evaluation";

import { mm } from "../../../canvas/mm";
import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, PickOne } from "../../fields";
import { AnswerBox, ItemRow, ItemRows, PaperHint } from "../../paper";

/**
 * Fracții — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the checks
 * and the marking. What this file adds is the one thing a fraction needs that a
 * string cannot carry: the bar.
 *
 * ## A fraction is two lines and a rule, not a glyph and not an image
 *
 * "1/2" drawn stacked is a two-line inline-flex column with a hairline between
 * the halves. The rejected alternatives were Unicode's ready-made fractions and
 * an SVG. Unicode has ½ and ¾ and stops, so "7/12" would print in a different
 * shape from "1/2" on the same row; an SVG would not inherit the theme's type
 * and would need its own size, colour and baseline, which is three more things
 * to keep in step with a paper that can be re-themed. Two spans inherit all of
 * it, and the rule's width comes from `theme.exerciseDefaults.answerRuleWidthMm`
 * so it matches every other rule the pupil sees.
 *
 * ## The task and its box share one line of text
 *
 * Unlike the sibling arithmetic type, the task is NOT put in `ItemRow`'s fixed
 * label slot. A stacked fraction makes the row two lines tall, and `ItemRow`
 * aligns its two slots to the top, so the box would ride up level with the
 * numerator. Keeping the tokens and the box in a single inline flow lets
 * `vertical-align: middle` on the fraction do the work and sits the box on the
 * text baseline, where a pupil expects to write.
 *
 * ## Tokens the type does not recognise print as typed
 *
 * The line is split on whitespace and only `a/b` is treated specially. "+",
 * "=", "din", a word, a number — all print unchanged. That is what keeps this
 * renderer from being the authority on what a fractions exercise may say: a
 * task it does not understand still prints correctly, rather than printing as
 * nothing.
 */

const COPY = {
  tasks: "Exercițiile",
  tasksHint: "Câte un exercițiu pe rând, cu fracțiile scrise 1/2: 1/2 + 1/4 =",
  stacked: "Cum se scriu fracțiile",
  stackedOver: "Ca fracție, una peste alta",
  stackedInline: "Pe un rând, cu bară oblică",
  results: "Rezultatele",
  resultsHint:
    "Câte un rezultat pe rând, în aceeași ordine ca exercițiile de mai sus.",
} as const;

export const definition = fractionsExercise;

const FRACTION = /^(-?\d+)\/(\d+)$/;

/** One `a/b` token: numerator over a hairline over denominator. */
function StackedFraction({
  theme,
  top,
  bottom,
}: {
  theme: Theme;
  top: string;
  bottom: string;
}) {
  return (
    <span
      style={{
        display: "inline-flex",
        flexDirection: "column",
        textAlign: "center",
        verticalAlign: "middle",
      }}
    >
      <span>{top}</span>
      <span
        style={{
          borderTopStyle: "solid",
          borderTopWidth: mm(theme.exerciseDefaults.answerRuleWidthMm),
          borderTopColor: resolveColor(theme, "text"),
        }}
      >
        {bottom}
      </span>
    </span>
  );
}

/** The task, token by token, with `a/b` drawn as a real fraction. */
function TaskText({ theme, task }: { theme: Theme; task: string }) {
  const tokens = task.split(/\s+/).filter((token) => token !== "");

  return (
    <>
      {tokens.map((token, index) => {
        const parts = FRACTION.exec(token);
        const top = parts?.[1];
        const bottom = parts?.[2];

        return (
          <span key={index}>
            {index > 0 ? " " : null}
            {top === undefined || bottom === undefined ? (
              token
            ) : (
              <StackedFraction theme={theme} top={top} bottom={bottom} />
            )}
          </span>
        );
      })}
    </>
  );
}

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = FractionsConfig.safeParse(config);
  const tasks = parsed.success ? parsed.data.tasks : [];
  const stacked = parsed.success ? parsed.data.stacked : true;

  if (tasks.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <ItemRows layoutId={layoutId}>
      {tasks.map((task, index) => (
        <ItemRow key={index}>
          {task.trim() === "" && mode === "edit" ? (
            <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
          ) : stacked ? (
            <TaskText theme={theme} task={task} />
          ) : (
            task
          )}{" "}
          <AnswerBox theme={theme} widthMm={16} />
        </ItemRow>
      ))}
    </ItemRows>
  );
}

/**
 * The results list, re-cut to one row per task.
 *
 * Called only when the TASKS change, so a teacher typing results is never
 * interrupted by the control shortening the line under their cursor. What was
 * already written is kept by position.
 */
const toLength = (results: readonly string[], count: number): string[] =>
  Array.from({ length: count }, (_, index) => results[index] ?? "");

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = FractionsConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : fractionsExercise.defaults;

  const parsedAnswer = FractionsAnswer.safeParse(answer);
  const results = parsedAnswer.success ? parsedAnswer.data.results : [];

  const emit = (
    nextConfig: FractionsConfig,
    nextResults: readonly string[],
  ): void =>
    onChange({
      config: nextConfig,
      answer: nextResults.length === 0 ? null : { results: nextResults },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LineListField
          id={`${idPrefix}-tasks`}
          label={COPY.tasks}
          hint={COPY.tasksHint}
          items={current.tasks}
          onChange={(tasks) =>
            emit({ ...current, tasks }, toLength(results, tasks.length))
          }
        />

        <PickOne
          name={`${idPrefix}-stacked`}
          label={COPY.stacked}
          options={[
            { value: "stacked", label: COPY.stackedOver },
            { value: "inline", label: COPY.stackedInline },
          ]}
          value={current.stacked ? "stacked" : "inline"}
          onChange={(value) =>
            emit({ ...current, stacked: value === "stacked" }, results)
          }
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <LineListField
          id={`${idPrefix}-results`}
          label={COPY.results}
          hint={COPY.resultsHint}
          items={results}
          onChange={(nextResults) => emit(current, nextResults)}
        />
      </FieldGroup>
    </>
  );
}
