import {
  ComparisonSign,
  NumberComparisonAnswer,
  NumberComparisonConfig,
  numberComparisonExercise,
  splitPair,
} from "@ludicon/evaluation";

import { mm } from "../../../canvas/mm";
import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { FieldGroup, LineListField, RowChoices } from "../../fields";
import { AnswerBox, ItemRows, PaperHint } from "../../paper";

/**
 * Compară numerele — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * checks and the marking, including `splitPair`, which is imported rather than
 * repeated: the barem and the paper have to agree about which number is on the
 * left, and two implementations of that would eventually disagree on a row with
 * an odd space in it.
 *
 * ## A row is a centred group, which is why it is not an `ItemRow`
 *
 * The three parts belong together — number, box, number — and they read as a
 * comparison only when the box sits between them on the same line and the trio
 * is centred in its cell. `ItemRow` is built for a fixed label followed by
 * flowing content and pins `align-items: flex-start` with no horizontal
 * alignment, so the box would ride at the top of the row and the group would
 * hug the left edge. This is the one place in these three types where the
 * shared row primitive does not fit; the layout still comes from `ItemRows`, so
 * grid, two-column and compact all behave exactly as they do everywhere else.
 *
 * ## The barem is filled from the top down
 *
 * `signs` is a plain list of signs with no room for a hole, so the barem covers
 * the first N rows and `validateAnswer` reports the rest as missing. The
 * alternative — dropping the unchosen rows out of the list — would slide a sign
 * chosen for the third pair up onto the first, which is a marking sheet that is
 * confidently wrong about a paper. Choosing out of order therefore does
 * nothing visible rather than something incorrect, and the field's hint asks
 * for top-down so the teacher is never surprised by it.
 */

const COPY = {
  rows: "Perechile de numere",
  rowsHint: "Câte două numere pe rând, despărțite printr-un spațiu: 45 54",
  signs: "Semnul potrivit",
  signsHint: "Alege semnul pentru fiecare pereche, de sus în jos.",
  signLess: "mai mic (<)",
  signGreater: "mai mare (>)",
  signEqual: "egal (=)",
} as const;

export const definition = numberComparisonExercise;

/** The pair as it reads in the barem picker: "45 … 54". */
const pairLabel = (row: string): string => {
  const { left, right } = splitPair(row);
  return left === "" && right === "" ? "" : `${left} … ${right}`;
};

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = NumberComparisonConfig.safeParse(config);
  const rows = parsed.success ? parsed.data.rows : [];

  if (rows.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <ItemRows layoutId={layoutId}>
      {rows.map((row, index) => {
        const { left, right } = splitPair(row);

        if (left === "" && right === "") {
          return (
            <div key={index}>
              {mode === "edit" ? (
                <PaperHint theme={theme}>
                  {EVALUATION_COPY.emptyTextHint}
                </PaperHint>
              ) : null}
            </div>
          );
        }

        return (
          <div
            key={index}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              columnGap: mm(3),
              minWidth: 0,
            }}
          >
            <span>{left}</span>
            <AnswerBox theme={theme} widthMm={9} heightMm={7} />
            <span>{right}</span>
          </div>
        );
      })}
    </ItemRows>
  );
}

const isComparisonSign = (value: string | null): value is ComparisonSign =>
  ComparisonSign.safeParse(value).success;

/**
 * The signs the barem can actually hold: every row from the top until the first
 * one nothing has been chosen for.
 */
const signPrefix = (
  values: readonly (string | null)[],
  rowCount: number,
): ComparisonSign[] => {
  const wanted = values.slice(0, rowCount);
  const gap = wanted.findIndex((value) => !isComparisonSign(value));
  return (gap < 0 ? wanted : wanted.slice(0, gap)).filter(isComparisonSign);
};

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = NumberComparisonConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : numberComparisonExercise.defaults;

  const parsedAnswer = NumberComparisonAnswer.safeParse(answer);
  const signs = parsedAnswer.success ? parsedAnswer.data.signs : [];

  const emit = (
    nextConfig: NumberComparisonConfig,
    nextSigns: readonly (string | null)[],
  ): void => {
    const kept = signPrefix(nextSigns, nextConfig.rows.length);
    onChange({
      config: nextConfig,
      answer: kept.length === 0 ? null : { signs: kept },
    });
  };

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        {/**
         * Shortening the list would leave the barem holding signs for pairs
         * that are gone, so the signs are re-cut in the same call that writes
         * the rows — one edit, one step of undo.
         */}
        <LineListField
          id={`${idPrefix}-rows`}
          label={COPY.rows}
          hint={COPY.rowsHint}
          items={current.rows}
          onChange={(rows) => emit({ ...current, rows }, signs)}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <RowChoices
          label={COPY.signs}
          hint={COPY.signsHint}
          rows={current.rows.map(pairLabel)}
          options={[
            { value: "<", label: COPY.signLess },
            { value: ">", label: COPY.signGreater },
            { value: "=", label: COPY.signEqual },
          ]}
          values={signs}
          emptyLabel={EVALUATION_COPY.answerNotChosen}
          onChange={(values) => emit(current, values)}
        />
      </FieldGroup>
    </>
  );
}
