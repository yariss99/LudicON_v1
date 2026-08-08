import {
  ShortAnswerAnswer,
  ShortAnswerConfig,
  shortAnswerExercise,
} from "@ludicon/evaluation";

import { mm } from "../../../canvas/mm";
import { EVALUATION_COPY } from "../../../copy";
import type {
  ExerciseBodyProps,
  ExerciseFieldsProps,
} from "../../exercise-module";
import { CountField, FieldGroup, LineListField, TextField } from "../../fields";
import { Blank, PaperHint, PaperNote, WritingLines } from "../../paper";

/**
 * Răspuns scurt — the printed half and the panel half.
 *
 * The definition next door in `@ludicon/evaluation` owns the schema, the
 * defaults, the checks and the marking; this file owns only pixels, and the two
 * are joined by the `type` string alone.
 *
 * ## `compact` is a blank in the line, not a shorter stack of rules
 *
 * The layout is declared at fourteen millimetres — less than one ruled line
 * plus the space above it — because a compact short answer is meant to sit in a
 * narrow column beside three others. A rule spanning that column reads as the
 * start of a new paragraph, so `compact` draws a `Blank` instead: the same rule
 * at a fixed width, inline, so the answer stays on the cerință's own line.
 *
 * ## The unit sits on the first rule, so it is placed against it
 *
 * "kg" belongs at the end of the space it measures, not under the last line of
 * a four-line answer. `WritingLines` draws its own rules and takes no children,
 * so the note is a sibling aligned to where the first rule is — which is the
 * one number this file has to know about that component.
 *
 * ## Nothing is written on the paper
 *
 * Both modes draw empty lines. The accepted spellings are read from
 * `describeAnswer` onto the barem, which is a separate printout; the pupil's
 * sheet has never seen them.
 */

const COPY = {
  lines: "Câte rânduri are de scris",
  linesHint: "Un rând pentru un cuvânt, mai multe pentru o propoziție.",
  unit: "Ce scrie după răspuns",
  unitHint: "ex. kg, ani, lei. Lasă gol dacă nu trebuie nimic.",
  accepted: "Răspunsurile pe care le accepți",
  acceptedHint:
    "Câte unul pe rând. La corectare nu contează diacriticele și literele mari.",
} as const;

/**
 * The space `WritingLines` leaves above its first rule.
 *
 * Restated from `paper.tsx` because that component takes no children: the unit
 * has to be placed against a rule drawn inside it, and the only way to sit on
 * the first one is to start where it starts. If the two ever disagree the unit
 * floats off the line, which the preview shows immediately.
 */
const FIRST_RULE_TOP_MM = 1.5;

/** Mirrors the bounds on `ShortAnswerConfig.lines`, which a field cannot read. */
const LEAST_LINES = 1;
const MOST_LINES = 4;

export const definition = shortAnswerExercise;

export function Body({ config, theme, layoutId, mode }: ExerciseBodyProps) {
  const parsed = ShortAnswerConfig.safeParse(config);

  if (!parsed.success) {
    return mode === "edit" ? (
      <PaperHint theme={theme}>{EVALUATION_COPY.exerciseUnfinished}</PaperHint>
    ) : null;
  }

  const unit = parsed.data.unit.trim();

  if (layoutId === "compact") {
    return (
      <>
        <Blank theme={theme} />
        {unit === "" ? null : (
          <>
            {" "}
            <PaperNote theme={theme}>{unit}</PaperNote>
          </>
        )}
      </>
    );
  }

  return (
    <div
      style={{ display: "flex", alignItems: "flex-start", columnGap: mm(2) }}
    >
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <WritingLines theme={theme} count={parsed.data.lines} />
      </div>
      {unit === "" ? null : (
        <span
          style={{
            flex: "none",
            display: "flex",
            alignItems: "flex-end",
            marginTop: mm(FIRST_RULE_TOP_MM),
            height: mm(theme.exerciseDefaults.answerLineGapMm),
          }}
        >
          <PaperNote theme={theme}>{unit}</PaperNote>
        </span>
      )}
    </div>
  );
}

export function Fields({
  config,
  answer,
  idPrefix,
  onChange,
}: ExerciseFieldsProps) {
  const parsedConfig = ShortAnswerConfig.safeParse(config);
  const current = parsedConfig.success
    ? parsedConfig.data
    : shortAnswerExercise.defaults;

  const parsedAnswer = ShortAnswerAnswer.safeParse(answer);
  const accepted = parsedAnswer.success ? parsedAnswer.data.accepted : [];

  /**
   * A list nobody has started is no barem row; a list of blank lines IS one.
   *
   * Pressing Enter to make room for a second spelling leaves a blank line, and
   * clearing the barem at that moment would take the teacher's cursor with it.
   * So blanks are stored and the paper's checklist says the barem has nothing
   * in it yet — a sentence they can act on, rather than a control that argues
   * with them while they type.
   */
  const emit = (
    nextConfig: typeof current,
    nextAccepted: readonly string[],
  ): void =>
    onChange({
      config: nextConfig,
      answer:
        nextAccepted.length === 0 ? null : { accepted: [...nextAccepted] },
    });

  return (
    <>
      <FieldGroup title={EVALUATION_COPY.groupExerciseQuestion}>
        <CountField
          id={`${idPrefix}-lines`}
          label={COPY.lines}
          hint={COPY.linesHint}
          value={current.lines}
          least={LEAST_LINES}
          most={MOST_LINES}
          onChange={(lines) => emit({ ...current, lines }, accepted)}
        />

        <TextField
          id={`${idPrefix}-unit`}
          label={COPY.unit}
          hint={COPY.unitHint}
          value={current.unit}
          onChange={(unit) => emit({ ...current, unit }, accepted)}
        />
      </FieldGroup>

      <FieldGroup title={EVALUATION_COPY.groupExerciseAnswer}>
        <LineListField
          id={`${idPrefix}-accepted`}
          label={COPY.accepted}
          hint={COPY.acceptedHint}
          items={accepted}
          onChange={(next) => emit(current, next)}
        />
      </FieldGroup>
    </>
  );
}
