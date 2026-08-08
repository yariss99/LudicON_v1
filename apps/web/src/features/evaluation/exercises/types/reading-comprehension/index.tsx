import {
  ReadingComprehensionAnswer,
  ReadingComprehensionConfig,
  readingComprehensionExercise,
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
import {
  ItemRow,
  ItemRows,
  PaperHint,
  PaperNote,
  PaperPanel,
  positionLabel,
  WritingLines,
} from "../../paper";

/**
 * Text cu întrebări — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels.
 *
 * ## The passage is framed, the questions are not
 *
 * `PaperPanel` around the text and nothing around the questions, because the
 * frame is doing one job: telling the pupil where the reading stops and the
 * answering starts. Framing both would spend the same signal twice and say
 * nothing. The panel is also what keeps the passage recognisable after a
 * photocopier has flattened every tint on the sheet to the same grey.
 *
 * ## The writing lines sit under the question, at full measure
 *
 * Each question is a row of its own — the number, the text — and its ruled
 * lines are a sibling BELOW that row rather than a child of it. Nested inside,
 * the lines would inherit the width of the question's text and a two-word
 * question would get a two-word rule. This is the arrangement that makes every
 * line on the sheet the same length whatever the question above it says.
 *
 * ## A blank question still prints its number
 *
 * In `preview` a question with no text is drawn as "3." and nothing else,
 * because that is what the printer produces, and because the paper's checklist
 * says "întrebarea de pe locul 3 nu are text" — a sentence that has to point at
 * something the teacher can see.
 */

const COPY = {
  passage: "Textul de citit",
  passageHint: "Lipește-l sau scrie-l. Rândurile rămân așa cum le scrii.",
  source: "De unde este textul",
  sourceHint: "Autorul sau cartea. Se tipărește mic, sub text.",
  questions: "Întrebările",
  questionsHint: "Câte o întrebare pe rând.",
  linesPerQuestion: "Câte rânduri sub fiecare întrebare",
  answers: "Răspunsurile așteptate",
  answersHint:
    "Câte un răspuns pe rând, în ordinea întrebărilor. Se tipăresc numai în barem.",
} as const;

/**
 * The barem is one answer per question, matched by position.
 *
 * So the list is re-cut to the questions' length in the same call that writes
 * the questions: answers already written keep their place, a new question
 * arrives with an empty row, and a removed one takes its answer with it. The
 * alternative — leaving the barem alone and letting the paper's checklist
 * complain — would let a teacher print a sheet whose fourth answer belongs to
 * the question they deleted this morning.
 */
const resize = (answers: readonly string[], count: number): string[] =>
  Array.from({ length: count }, (_, index) => answers[index] ?? "");

export const definition = readingComprehensionExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = ReadingComprehensionConfig.safeParse(config);
  if (!parsed.success) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const { passage, source, questions, linesPerQuestion } = parsed.data;

  return (
    <>
      <PaperPanel theme={theme}>
        <div style={{ whiteSpace: "pre-wrap" }}>
          {passage.trim() === "" && mode === "edit" ? (
            <PaperHint theme={theme}>{EVALUATION_COPY.emptyTextHint}</PaperHint>
          ) : (
            passage
          )}
        </div>

        {source.trim() === "" ? null : (
          <div style={{ marginTop: mm(1.5), textAlign: "right" }}>
            <PaperNote theme={theme}>{source}</PaperNote>
          </div>
        )}
      </PaperPanel>

      <div style={{ marginTop: mm(3) }}>
        <ItemRows layoutId={layoutId} gapMm={2.5}>
          {questions.map((question, index) => (
            <div key={index}>
              <ItemRow label={positionLabel(index)}>
                {question.trim() === "" && mode === "edit" ? (
                  <PaperHint theme={theme}>
                    {EVALUATION_COPY.emptyTextHint}
                  </PaperHint>
                ) : (
                  question
                )}
              </ItemRow>

              <WritingLines theme={theme} count={linesPerQuestion} />
            </div>
          ))}
        </ItemRows>
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
  const parsedConfig = ReadingComprehensionConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : readingComprehensionExercise.defaults;

  const parsedAnswer = ReadingComprehensionAnswer.safeParse(answer);
  const answers = parsedAnswer.success ? parsedAnswer.data.answers : [];

  const emit = (
    nextConfig: typeof current,
    nextAnswers: readonly string[],
  ): void => onChange({ config: nextConfig, answer: { answers: nextAnswers } });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <LongTextField
          id={`${idPrefix}-passage`}
          label={COPY.passage}
          hint={COPY.passageHint}
          value={current.passage}
          rows={8}
          onChange={(passage) => emit({ ...current, passage }, answers)}
        />

        <TextField
          id={`${idPrefix}-source`}
          label={COPY.source}
          hint={COPY.sourceHint}
          value={current.source}
          onChange={(source) => emit({ ...current, source }, answers)}
        />

        <LineListField
          id={`${idPrefix}-questions`}
          label={COPY.questions}
          hint={COPY.questionsHint}
          items={current.questions}
          onChange={(questions) =>
            emit({ ...current, questions }, resize(answers, questions.length))
          }
        />

        <CountField
          id={`${idPrefix}-lines-per-question`}
          label={COPY.linesPerQuestion}
          value={current.linesPerQuestion}
          least={1}
          most={8}
          onChange={(linesPerQuestion) =>
            emit({ ...current, linesPerQuestion }, answers)
          }
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <LineListField
          id={`${idPrefix}-answers`}
          label={COPY.answers}
          hint={COPY.answersHint}
          items={answers}
          onChange={(next) => emit(current, next)}
        />
      </FieldGroup>
    </>
  );
}
