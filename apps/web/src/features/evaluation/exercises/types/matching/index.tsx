import type { ReactNode } from "react";
import {
  MatchingAnswer,
  MatchingConfig,
  matchingExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, RowChoices } from "../../fields";
import {
  ItemRow,
  optionLabel,
  PaperHint,
  positionLabel,
  SplitRows,
} from "../../paper";

/**
 * Potrivire pe coloane — the printed half and the panel half.
 *
 * ## The right column prints in the order the teacher typed it
 *
 * It is never shuffled, for two separate reasons and either would be enough.
 * A printed paper has to be the same document every time it is opened: a
 * teacher hands out thirty copies, reprints one after a jam, and marks all
 * thirty against a barem that says "1. → c)". A shuffle in the renderer makes
 * that "c)" true of one copy and false of another, and nothing on either sheet
 * would look wrong. The second reason is that scrambling is a pedagogical
 * decision, not a rendering one — putting the obvious pair on the same row is
 * how a teacher makes a question easy for clasa I, and the product does not get
 * to overrule them.
 *
 * ## The two columns are one grid, so the rows stay in register
 *
 * A pupil draws a line from a left item to a right one, so the two columns have
 * to sit at the same heights or the lines cross for no reason. `SplitRows` puts
 * every cell in ONE grid rather than two stacks, so an item long enough to wrap
 * grows its whole row and its partner comes with it. Two independent columns
 * looked identical until the first long item, at which point everything below
 * it lost its partner by a line height.
 *
 * ## All three layouts draw the same two columns
 *
 * `layoutId` is unused here. Two columns IS this type's arrangement, so the
 * declared layouts differ in the space the paginator budgets and in the frame
 * `exercise-view.tsx` draws for `card` — not in what this file lays out.
 */

const COPY = {
  left: "Coloana din stânga",
  leftHint: "Câte un element pe rând.",
  right: "Coloana din dreapta",
  rightHint: "Câte un element pe rând, în ordinea în care se tipăresc.",
  pairs: "Perechile corecte",
  pairsHint:
    "Pentru fiecare element din stânga, alege perechea lui. Se tipărește numai în barem.",
} as const;

/** Wide enough for a pupil to draw the lines without touching the words. */
const GUTTER_MM = 16;
/** A floor on the row, so two short items are still far enough apart to join. */
const ROW_MM = 9;

export const definition = matchingExercise;

export function Body({ config, theme, mode }: ExerciseBodyProps) {
  const parsed = MatchingConfig.safeParse(config);
  const left = parsed.success ? parsed.data.left : [];
  const right = parsed.success ? parsed.data.right : [];

  if (left.length === 0 && right.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const cell = (item: string): ReactNode =>
    item.trim() === "" && mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
    ) : (
      item
    );

  /**
   * The grid is as long as the longer column.
   *
   * A matching exercise with four items on the left and five on the right is a
   * legitimate question — the extra right-hand item is a distractor, which is
   * how a teacher stops elimination from solving the last pair — so the shorter
   * column simply runs out and the row still exists on the other side.
   */
  const rowCount = Math.max(left.length, right.length);

  return (
    <SplitRows
      gapMm={GUTTER_MM}
      minRowMm={ROW_MM}
      rows={Array.from({ length: rowCount }, (_, index) => ({
        key: String(index),
        left:
          index < left.length ? (
            <ItemRow label={positionLabel(index)}>
              {cell(left[index] ?? "")}
            </ItemRow>
          ) : null,
        right:
          index < right.length ? (
            <ItemRow label={optionLabel(index, "letters")}>
              {cell(right[index] ?? "")}
            </ItemRow>
          ) : null,
      }))}
    />
  );
}

/**
 * The barem read back out of the row pickers.
 *
 * `pairs` is a plain list of numbers, so there is no way to store "row three is
 * answered and rows one and two are not" — it stops at the first row nothing
 * has been chosen for. A teacher filling the barem down the page keeps
 * everything they picked; one who starts in the middle sees their choice come
 * back empty, and the paper's checklist says the barem is short until they fill
 * the rows above it. The alternative was a placeholder number in the gaps,
 * which would print as a confident, wrong answer.
 */
const untilUnchosen = (values: readonly (string | null)[]): number[] => {
  const gap = values.findIndex((value) => value === null);
  const chosen = gap < 0 ? values : values.slice(0, gap);
  return chosen.map((value) => Number(value));
};

/** Drops pairs whose row is gone and pairs pointing past the right column. */
const clampPairs = (
  pairs: readonly number[],
  leftCount: number,
  rightCount: number,
): number[] => {
  const kept = pairs.slice(0, leftCount);
  const stranded = kept.findIndex((pair) => pair >= rightCount);
  return stranded < 0 ? kept : kept.slice(0, stranded);
};

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = MatchingConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : matchingExercise.defaults;

  const parsedAnswer = MatchingAnswer.safeParse(answer);
  const pairs = parsedAnswer.success ? parsedAnswer.data.pairs : [];

  const emit = (nextConfig: typeof current, nextPairs: number[]): void =>
    onChange({
      config: nextConfig,
      answer: nextPairs.length === 0 ? null : { pairs: nextPairs },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LineListField
          id={`${idPrefix}-left`}
          label={COPY.left}
          hint={COPY.leftHint}
          items={current.left}
          onChange={(left) =>
            emit(
              { ...current, left },
              clampPairs(pairs, left.length, current.right.length),
            )
          }
        />

        <LineListField
          id={`${idPrefix}-right`}
          label={COPY.right}
          hint={COPY.rightHint}
          items={current.right}
          onChange={(right) =>
            emit(
              { ...current, right },
              clampPairs(pairs, current.left.length, right.length),
            )
          }
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <RowChoices
          label={COPY.pairs}
          hint={COPY.pairsHint}
          rows={current.left}
          options={current.right.map((item, index) => ({
            value: String(index),
            label:
              item.trim() === ""
                ? optionLabel(index, "letters")
                : `${optionLabel(index, "letters")} ${item}`,
          }))}
          values={current.left.map((_item, index) => {
            const pair = pairs[index];
            return pair === undefined ? null : String(pair);
          })}
          emptyLabel={EVALUATION_COPY.answerNotChosen}
          onChange={(values) => emit(current, untilUnchosen(values))}
        />
      </FieldGroup>
    </>
  );
}
