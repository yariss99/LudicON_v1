import type { ReactNode } from "react";
import {
  OrderingAnswer,
  OrderingBoxSide,
  OrderingConfig,
  orderingExercise,
  type Theme,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, PickOne, RowChoices } from "../../fields";
import { AnswerBox, ItemRow, ItemRows, PaperHint } from "../../paper";

/**
 * Pune în ordine — the printed half and the panel half.
 *
 * ## Nothing here decides the sequence
 *
 * The items are drawn in the order `config.items` holds them, which is the
 * order the teacher typed. The correct sequence is in the barem and this file
 * never reads it, so there is no path by which the answer can reach the pupil's
 * sheet — and reprinting the same paper twice gives the same paper twice, which
 * a renderer that shuffled could not promise.
 *
 * ## The box is small, square, and empty
 *
 * Seven millimetres each way: room for one or two digits in a clasa a II-a hand
 * and no more, because a box the size of a writing line invites a word. It is
 * always empty in both modes — `preview` has to be the truth about the printer,
 * and a box with the right number already in it is the barem, not the paper.
 *
 * ## Where the primitives stop
 *
 * `ItemRow` puts its label before its content and its content span does not
 * grow, so a box printed against the RIGHT margin cannot be expressed through
 * it — the rows in that arrangement are a flex row written here instead, with
 * the same gap so the two sides measure alike. The left arrangement, which is
 * the default and the common one, is `ItemRow` with the box as its label.
 */

const COPY = {
  items: "Elementele",
  itemsHint: "Câte un element pe rând, în ordinea în care se tipăresc.",
  side: "Unde se pune căsuța",
  sideLeft: "În stânga elementului",
  sideRight: "În dreapta elementului",
  order: "Ordinea corectă",
  orderHint:
    "Spune ce element stă pe fiecare loc. Se tipărește numai în barem.",
  place: (index: number) => `Locul ${index + 1}`,
} as const;

const BOX_MM = 7;
const GAP_MM = 1.6;

export const definition = orderingExercise;

/**
 * The box goes in whichever of `ItemRow`'s two slots the teacher asked for.
 *
 * Both sides are the same component so the gap between the box and the words is
 * one number, on both sides, for every row. This was a local flex row for the
 * right-hand case until `ItemRow` grew its trailing slot; the two versions had
 * already drifted to different gaps, which on a printed sheet reads as the
 * boxes being a different distance from the text depending on a setting that
 * was supposed to be about which margin they sit against.
 */
function NumberedRow({
  theme,
  side,
  children,
}: {
  theme: Theme;
  side: OrderingBoxSide;
  children: ReactNode;
}) {
  const box = <AnswerBox theme={theme} widthMm={BOX_MM} heightMm={BOX_MM} />;

  return side === "left" ? (
    <ItemRow label={box} gapMm={GAP_MM}>
      {children}
    </ItemRow>
  ) : (
    <ItemRow trailing={box} gapMm={GAP_MM}>
      {children}
    </ItemRow>
  );
}

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = OrderingConfig.safeParse(config);
  const items = parsed.success ? parsed.data.items : [];
  const side = parsed.success
    ? parsed.data.boxSide
    : orderingExercise.defaults.boxSide;

  if (items.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <ItemRows layoutId={layoutId}>
      {items.map((item, index) => (
        <NumberedRow key={index} theme={theme} side={side}>
          {item.trim() === "" && mode === "edit" ? (
            <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
          ) : (
            item
          )}
        </NumberedRow>
      ))}
    </ItemRows>
  );
}

/**
 * The sequence read back out of the row pickers.
 *
 * `order` is a plain list of item positions and cannot hold a gap, so it stops
 * at the first place nothing has been chosen for. A teacher working down the
 * places keeps everything they picked; until the last one is filled the paper's
 * checklist says the barem is short, which is better than a placeholder number
 * that would print as a confident, wrong answer.
 */
const untilUnchosen = (values: readonly (string | null)[]): number[] => {
  const gap = values.findIndex((value) => value === null);
  const chosen = gap < 0 ? values : values.slice(0, gap);
  return chosen.map((value) => Number(value));
};

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = OrderingConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : orderingExercise.defaults;

  const parsedAnswer = OrderingAnswer.safeParse(answer);
  const order = parsedAnswer.success ? parsedAnswer.data.order : [];

  const emit = (nextConfig: typeof current, nextOrder: number[]): void =>
    onChange({
      config: nextConfig,
      answer: nextOrder.length === 0 ? null : { order: nextOrder },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        {/**
         * Adding or removing an item renumbers every position the barem names,
         * so the sequence is cleared rather than shifted: a barem that is
         * plainly empty asks to be filled in, and one that is quietly wrong
         * gets printed. Rewording an item leaves it alone — the positions are
         * still the same positions.
         */}
        <LineListField
          id={`${idPrefix}-items`}
          label={COPY.items}
          hint={COPY.itemsHint}
          items={current.items}
          onChange={(items) =>
            emit(
              { ...current, items },
              items.length === current.items.length ? [...order] : [],
            )
          }
        />

        <PickOne
          name={`${idPrefix}-side`}
          label={COPY.side}
          options={[
            { value: "left", label: COPY.sideLeft },
            { value: "right", label: COPY.sideRight },
          ]}
          value={current.boxSide}
          onChange={(value) => {
            const side = OrderingBoxSide.safeParse(value);
            if (side.success)
              emit({ ...current, boxSide: side.data }, [...order]);
          }}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <RowChoices
          label={COPY.order}
          hint={COPY.orderHint}
          rows={current.items.map((_item, index) => COPY.place(index))}
          options={current.items.map((item, index) => ({
            value: String(index),
            label: item.trim() === "" ? COPY.place(index) : item,
          }))}
          values={current.items.map((_item, index) => {
            const chosen = order[index];
            return chosen === undefined ? null : String(chosen);
          })}
          emptyLabel={EVALUATION_COPY.answerNotChosen}
          onChange={(values) => emit(current, untilUnchosen(values))}
        />
      </FieldGroup>
    </>
  );
}
