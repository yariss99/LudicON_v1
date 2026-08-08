import {
  ArithmeticAnswer,
  ArithmeticConfig,
  arithmeticExercise,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { CountField, FieldGroup, LineListField } from "../../fields";
import {
  AnswerBox,
  ItemRow,
  ItemRows,
  PaperHint,
  WritingLines,
} from "../../paper";

/**
 * Calcul — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels. The two are
 * joined by the `type` string and by nothing else, which is what lets the API
 * and the PDF worker import the first without importing React.
 *
 * ## The sum prints exactly as it was typed
 *
 * Nothing here parses "24 + 17 =". A row is the teacher's own string in the
 * fixed slot of an `ItemRow`, then a box in the flexible one, and that is the
 * whole drawing. Rendering the operators ourselves — an × as a glyph, a column
 * sum aligned on its units — would make this file the authority on what
 * arithmetic looks like, and the first expression it could not draw would print
 * as nothing on a paper already at the photocopier. The expression goes in the
 * `label` slot precisely so it cannot wrap mid-sum when the exercise sits in a
 * narrow grid cell.
 *
 * ## `preview` draws the working lines; only the hints are edit-only
 *
 * The ruled lines under the set are part of the paper, so they are drawn in
 * both modes. What `edit` adds is the sentence in an empty row — a sum with no
 * text prints as a lone box, which on screen is a block the teacher cannot see
 * they have to finish. In `preview` that same row is drawn as the printer will
 * produce it, and the paper's checklist is where "exercițiul de pe locul 3 nu
 * are text" gets said.
 *
 * ## The barem is a second list, lined up by position
 *
 * Results are one textarea, not an input beside each sum. Ten inputs in a 344px
 * rail is ten tab stops and ten steps of undo; one textarea is one, and it is
 * the only version a teacher can paste an existing list into. The pairing is by
 * row number, which the field's own hint says out loud, because a barem whose
 * third line belongs to the second sum marks a class wrongly. Whenever the sums
 * change, the results are re-cut to the same length in the SAME call, so config
 * and barem move together in one step of undo.
 */

const COPY = {
  problems: "Exercițiile",
  problemsHint:
    "Câte un exercițiu pe rând, scris exact cum vrei să apară pe foaie: 24 + 17 =",
  workSpace: "Rânduri pentru socoteli",
  workSpaceHint:
    "Rânduri libere sub toate exercițiile, pentru calcule. Pune 0 dacă nu ai nevoie de ele.",
  results: "Rezultatele",
  resultsHint:
    "Câte un rezultat pe rând, în aceeași ordine ca exercițiile de mai sus.",
} as const;

export const definition = arithmeticExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = ArithmeticConfig.safeParse(config);
  const problems = parsed.success ? parsed.data.problems : [];
  const workSpaceLines = parsed.success ? parsed.data.workSpaceLines : 0;

  if (problems.length === 0) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  return (
    <>
      <ItemRows layoutId={layoutId}>
        {problems.map((problem, index) => (
          <ItemRow
            key={index}
            label={
              problem.trim() === "" && mode === "edit" ? (
                <PaperHint theme={theme}>
                  {EVALUATION_COPY.emptyTextHint}
                </PaperHint>
              ) : (
                problem
              )
            }
          >
            <AnswerBox theme={theme} widthMm={18} />
          </ItemRow>
        ))}
      </ItemRows>

      {workSpaceLines > 0 ? (
        <WritingLines theme={theme} count={workSpaceLines} />
      ) : null}
    </>
  );
}

/**
 * The results list, re-cut to one row per sum.
 *
 * Called only when the SUMS change, never while the teacher is typing results:
 * a control that truncated the line being written would take the cursor with
 * it, which is the behaviour `fields.tsx` exists to avoid. What was already
 * typed is kept by position, so adding a fifth sum leaves the first four
 * results where they were.
 */
const toLength = (results: readonly string[], count: number): string[] =>
  Array.from({ length: count }, (_, index) => results[index] ?? "");

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = ArithmeticConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : arithmeticExercise.defaults;

  const parsedAnswer = ArithmeticAnswer.safeParse(answer);
  const results = parsedAnswer.success ? parsedAnswer.data.results : [];

  const emit = (
    nextConfig: ArithmeticConfig,
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
          id={`${idPrefix}-problems`}
          label={COPY.problems}
          hint={COPY.problemsHint}
          items={current.problems}
          onChange={(problems) =>
            emit({ ...current, problems }, toLength(results, problems.length))
          }
        />

        <CountField
          id={`${idPrefix}-work-space`}
          label={COPY.workSpace}
          hint={COPY.workSpaceHint}
          value={current.workSpaceLines}
          least={0}
          most={8}
          onChange={(workSpaceLines) =>
            emit({ ...current, workSpaceLines }, results)
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
