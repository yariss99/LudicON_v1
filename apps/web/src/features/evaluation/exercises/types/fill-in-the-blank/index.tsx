import { Fragment } from "react";
import {
  FillInTheBlankAnswer,
  FillInTheBlankConfig,
  fillInTheBlankExercise,
  splitOnBlanks,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import {
  CountField,
  FieldGroup,
  LineListField,
  LongTextField,
} from "../../fields";
import { Blank, PaperHint } from "../../paper";

/**
 * Completează spațiile — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking. This file owns only pixels, and it does
 * not own the parser either: `splitOnBlanks` comes from the same module the
 * checks call, so the sentence drawn here and the sentence counted there cannot
 * disagree about how many holes it has.
 *
 * ## The teacher's line breaks are kept
 *
 * `white-space: pre-wrap` on the wrapper, so a text typed as four short lines
 * prints as four short lines. The alternative — collapsing whitespace the way
 * HTML does by default — quietly reflows a poem or a list of sentences into one
 * paragraph, and the teacher only finds out from the photocopier.
 *
 * ## Both layouts draw the same run of text
 *
 * `layoutId` is deliberately unused. A sentence is a sentence in either shape:
 * `card` is a frame drawn around the whole exercise by `exercise-view.tsx`, and
 * what the two declared layouts really differ in is the space the paginator
 * budgets. Splitting a sentence into columns to honour a layout id would break
 * it across the gutter mid-clause.
 *
 * ## The barem always has exactly one list per blank
 *
 * Every edit to the text re-lengths `answer.blanks` in the same call that
 * writes the text, so the two can never be seen out of step and cannot be
 * undone apart. Adding a hole in the middle of a sentence does shift the
 * spellings below it by one — the barem is a list of positions, and the
 * position they name has genuinely changed.
 */

const COPY = {
  text: "Textul cu spații",
  textHint:
    "Pune ___ (cel puțin trei liniuțe) acolo unde elevul scrie. Rândurile rămân cum le-ai scris.",
  width: "Cât de lung e spațiul",
  widthHint: "În milimetri — cât loc are elevul de scris.",
  blank: (index: number) => `Spațiul ${index + 1}`,
  blankHint: "Câte o variantă acceptată pe rând. Se tipărește numai în barem.",
} as const;

const LEAST_WIDTH_MM = 8;
const MOST_WIDTH_MM = 80;

export const definition = fillInTheBlankExercise;

export function Body({ config, theme, mode }: ExerciseBodyProps) {
  const parsed = FillInTheBlankConfig.safeParse(config);
  const text = parsed.success ? parsed.data.text : "";
  const widthMm = parsed.success
    ? parsed.data.blankWidthMm
    : fillInTheBlankExercise.defaults.blankWidthMm;

  if (text.trim() === "") {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const { parts } = splitOnBlanks(text);

  return (
    <div style={{ whiteSpace: "pre-wrap" }}>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 ? (
            <Blank theme={theme} widthMm={widthMm} />
          ) : null}
        </Fragment>
      ))}
    </div>
  );
}

/** The barem, re-cut to one list of accepted spellings per blank. */
const fitToBlanks = (
  blanks: readonly (readonly string[])[],
  count: number,
): string[][] =>
  Array.from({ length: count }, (_, index) => [...(blanks[index] ?? [])]);

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = FillInTheBlankConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : fillInTheBlankExercise.defaults;

  const parsedAnswer = FillInTheBlankAnswer.safeParse(answer);
  const stored = parsedAnswer.success ? parsedAnswer.data.blanks : [];
  const accepted = fitToBlanks(stored, splitOnBlanks(current.text).blanks);

  const emit = (nextConfig: typeof current, nextBlanks: string[][]): void =>
    onChange({
      config: nextConfig,
      answer: nextBlanks.length === 0 ? null : { blanks: nextBlanks },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LongTextField
          id={`${idPrefix}-text`}
          label={COPY.text}
          hint={COPY.textHint}
          value={current.text}
          onChange={(text) =>
            emit(
              { ...current, text },
              fitToBlanks(accepted, splitOnBlanks(text).blanks),
            )
          }
        />

        <CountField
          id={`${idPrefix}-width`}
          label={COPY.width}
          hint={COPY.widthHint}
          value={current.blankWidthMm}
          least={LEAST_WIDTH_MM}
          most={MOST_WIDTH_MM}
          onChange={(blankWidthMm) =>
            emit({ ...current, blankWidthMm }, accepted)
          }
        />
      </FieldGroup>

      {/**
       * No holes yet, so no barem group at all — a heading with nothing under
       * it reads as a control that has failed to load. The paper's own
       * checklist is where "nu are încă niciun loc de completat" gets said.
       */}
      {accepted.length === 0 ? null : (
        <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
          {accepted.map((spellings, index) => (
            <LineListField
              key={index}
              id={`${idPrefix}-blank-${index}`}
              label={COPY.blank(index)}
              hint={index === 0 ? COPY.blankHint : undefined}
              items={spellings}
              rows={2}
              onChange={(items) =>
                emit(
                  current,
                  accepted.map((one, position) =>
                    position === index ? items : one,
                  ),
                )
              }
            />
          ))}
        </FieldGroup>
      )}
    </>
  );
}
