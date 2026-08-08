import {
  ImageObservationAnswer,
  ImageObservationConfig,
  imageObservationExercise,
  resolveColor,
  type Theme,
} from "@ludicon/evaluation";

import { mm } from "../../../canvas/mm";
import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { CountField, FieldGroup, LineListField, TextField } from "../../fields";
import {
  ItemRow,
  ItemRows,
  PaperHint,
  positionLabel,
  SplitColumns,
  WritingLines,
} from "../../paper";

/**
 * Observă imaginea — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels.
 *
 * ## An address with no picture behind it still reserves its space
 *
 * When `src` is blank the exercise draws a dashed frame at the full stored
 * height, in `preview` as well as in `edit`. That is deliberate and it is the
 * one place this type departs from "draw nothing until it is written": the
 * teacher chose 55mm of this sheet, and a preview that closed the gap would
 * show them a page that fits and a printer that then does not. In `edit` the
 * frame also says what it is waiting for; in `preview` it is empty, because the
 * printer has no hints.
 *
 * ## `two-column` puts the picture BESIDE the questions
 *
 * Every other layout stacks them. Side by side, the two columns have unrelated
 * heights — a fixed picture against however many ruled lines the questions want
 * — so this is a grid, via `SplitColumns`: grid tracks are independent, and a
 * short image cannot drag the questions up or leave the column ragged the way
 * floated or inline-block halves would. The questions themselves always stack,
 * whichever layout is chosen; the layout decides where the picture goes, not
 * how the questions are arranged.
 */

const COPY = {
  src: "Adresa imaginii",
  alt: "Ce se vede în imagine",
  altHint: "Pentru elevii care ascultă pagina, și pentru tipar.",
  height: "Cât de înaltă este imaginea",
  heightHint: "În milimetri, pe foaie.",
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
 * arrives with an empty row, and a removed one takes its answer with it.
 */
const resize = (answers: readonly string[], count: number): string[] =>
  Array.from({ length: count }, (_, index) => answers[index] ?? "");

function Picture({
  theme,
  src,
  alt,
  heightMm,
  mode,
}: {
  theme: Theme;
  src: string;
  alt: string;
  heightMm: number;
  mode: ExerciseBodyProps["mode"];
}) {
  if (src.trim() === "") {
    return (
      <div
        style={{
          height: mm(heightMm),
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderStyle: "dashed",
          borderWidth: mm(theme.borders.hairlineMm),
          borderColor: resolveColor(theme, "borderStrong"),
        }}
      >
        {mode === "edit" ? (
          <PaperHint theme={theme}>{EVALUATION_COPY.emptyImageHint}</PaperHint>
        ) : null}
      </div>
    );
  }

  /* `contain` rather than `cover`: a photograph cropped to fit the teacher's
     height could lose the very thing the questions ask about. */
  return (
    <img
      src={src}
      alt={alt}
      style={{
        display: "block",
        width: "100%",
        height: mm(heightMm),
        objectFit: "contain",
      }}
    />
  );
}

export const definition = imageObservationExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = ImageObservationConfig.safeParse(config);
  if (!parsed.success) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const { src, alt, heightMm, questions, linesPerQuestion } = parsed.data;

  const picture = (
    <Picture
      theme={theme}
      src={src}
      alt={alt}
      heightMm={heightMm}
      mode={mode}
    />
  );

  /* `"standard"` and not the block's layout: when the block is `two-column`
     the two columns are the picture and this list, so the questions inside it
     must still stack. */
  const asked = (
    <ItemRows layoutId="standard" gapMm={2.5}>
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
  );

  if (layoutId === "two-column") {
    return <SplitColumns left={picture} right={asked} gapMm={6} />;
  }

  return (
    <>
      {picture}
      <div style={{ marginTop: mm(3) }}>{asked}</div>
    </>
  );
}

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = ImageObservationConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : imageObservationExercise.defaults;

  const parsedAnswer = ImageObservationAnswer.safeParse(answer);
  const answers = parsedAnswer.success ? parsedAnswer.data.answers : [];

  const emit = (
    nextConfig: typeof current,
    nextAnswers: readonly string[],
  ): void => onChange({ config: nextConfig, answer: { answers: nextAnswers } });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <TextField
          id={`${idPrefix}-src`}
          label={COPY.src}
          value={current.src}
          onChange={(src) => emit({ ...current, src }, answers)}
        />

        <TextField
          id={`${idPrefix}-alt`}
          label={COPY.alt}
          hint={COPY.altHint}
          value={current.alt}
          onChange={(alt) => emit({ ...current, alt }, answers)}
        />

        <CountField
          id={`${idPrefix}-height`}
          label={COPY.height}
          hint={COPY.heightHint}
          value={current.heightMm}
          least={20}
          most={160}
          onChange={(heightMm) => emit({ ...current, heightMm }, answers)}
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
          most={6}
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
