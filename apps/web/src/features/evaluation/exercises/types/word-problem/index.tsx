import {
  WordProblemAnswer,
  WordProblemConfig,
  wordProblemExercise,
} from "@ludicon/evaluation";

import { mm } from "../../../canvas/mm";
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
  TextField,
} from "../../fields";
import { AnswerBox, PaperHint, WritingLines } from "../../paper";

/**
 * Problemă — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels.
 *
 * ## The statement keeps the teacher's line breaks
 *
 * `white-space: pre-wrap` rather than collapsing the text into a paragraph. A
 * Romanian problem is routinely written as a stem and then a question on its
 * own line, and teachers paste them in already broken that way. Collapsing
 * would reflow that into a block the pupil has to re-parse, and the teacher
 * would have no way to get the break back — there is no rich text here, so the
 * newline they typed is the only formatting the field has.
 *
 * ## The answer box takes the rest of the line
 *
 * A grid of `auto 1fr` rather than a flex row: `AnswerBox` sizes to its content
 * and it has none, so as a flex item it would collapse to its 12mm floor and
 * print a stub the pupil cannot write a number in. A grid item stretches into
 * its track by default, which is the behaviour wanted and the reason the row is
 * a grid at all.
 */

const COPY = {
  statement: "Textul problemei",
  statementHint: "Rândurile rămân așa cum le scrii.",
  workLines: "Câte rânduri pentru rezolvare",
  workLinesHint: "Locul în care elevul calculează. Poate fi și zero.",
  answerLabel: "Ce scrie înaintea casetei",
  accepted: "Răspunsurile pe care le accepți",
  acceptedHint: "Câte o scriere pe rând — oricare dintre ele este bună.",
  steps: "Rezolvarea",
  stepsHint: "Câte un pas pe rând. Se tipărește numai în barem.",
} as const;

export const definition = wordProblemExercise;

export function Body({ config, theme, mode }: ExerciseBodyProps) {
  const parsed = WordProblemConfig.safeParse(config);
  if (!parsed.success) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const { statement, workLines, answerLabel } = parsed.data;

  if (statement.trim() === "") {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <>
      <div style={{ whiteSpace: "pre-wrap" }}>{statement}</div>

      {workLines > 0 ? <WritingLines theme={theme} count={workLines} /> : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          alignItems: "center",
          columnGap: mm(2),
          marginTop: mm(2.5),
        }}
      >
        <span>{answerLabel}</span>
        <AnswerBox theme={theme} />
      </div>
    </>
  );
}

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = WordProblemConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : wordProblemExercise.defaults;

  const parsedAnswer = WordProblemAnswer.safeParse(answer);
  const accepted = parsedAnswer.success ? parsedAnswer.data.accepted : [];
  const steps = parsedAnswer.success ? parsedAnswer.data.steps : [];

  /**
   * Both halves on every edit, and the barem is never cleared from here.
   *
   * `answer: null` is for a change that STRANDS the answer, and nothing in this
   * config can: the accepted spellings and the worked steps stay true however
   * the statement is reworded or the working lines are counted. An empty barem
   * is reported in words by the paper's checklist instead, which is a sentence
   * the teacher can act on rather than a field that empties itself.
   */
  const emit = (
    nextConfig: typeof current,
    nextAccepted: readonly string[],
    nextSteps: readonly string[],
  ): void =>
    onChange({
      config: nextConfig,
      answer: { accepted: nextAccepted, steps: nextSteps },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LongTextField
          id={`${idPrefix}-statement`}
          label={COPY.statement}
          hint={COPY.statementHint}
          value={current.statement}
          rows={5}
          onChange={(statement) =>
            emit({ ...current, statement }, accepted, steps)
          }
        />

        <CountField
          id={`${idPrefix}-work-lines`}
          label={COPY.workLines}
          hint={COPY.workLinesHint}
          value={current.workLines}
          least={0}
          most={20}
          onChange={(workLines) =>
            emit({ ...current, workLines }, accepted, steps)
          }
        />

        <TextField
          id={`${idPrefix}-answer-label`}
          label={COPY.answerLabel}
          value={current.answerLabel}
          onChange={(answerLabel) =>
            emit({ ...current, answerLabel }, accepted, steps)
          }
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <LineListField
          id={`${idPrefix}-accepted`}
          label={COPY.accepted}
          hint={COPY.acceptedHint}
          items={accepted}
          rows={3}
          onChange={(next) => emit(current, next, steps)}
        />

        <LineListField
          id={`${idPrefix}-steps`}
          label={COPY.steps}
          hint={COPY.stepsHint}
          items={steps}
          onChange={(next) => emit(current, accepted, next)}
        />
      </FieldGroup>
    </>
  );
}
