import { ExerciseNumbering, type Theme } from "@ludicon/evaluation";
import { Label, RadioGroup, RadioGroupItem, Switch } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { ColorTokenField, type BorrowableToken } from "./color-field";
import {
  Field,
  FieldGroup,
  NumberField,
  TextField,
  useFieldId,
} from "./inspector-field";

/**
 * The three groups that arrive shut: spacing, frames, and how exercises look.
 *
 * All three are millimetres and all three are things a teacher tunes once for a
 * house style and then never touches. Open by default they would be twenty
 * sliders standing between the panel's title and the two decisions that matter
 * — which is the "word-processor ribbon of 40 tools" the design book names.
 *
 * They are one file because they are one thought: everything the theme says
 * about measurements. Splitting them into three would be three files of forty
 * lines each with identical imports.
 */

/** What a frame line is allowed to be. Roles, not colours — see `ColorTokenField`. */
const FRAME_TOKENS: readonly BorrowableToken[] = [
  "border",
  "borderStrong",
  "text",
  "accent",
];

/**
 * The lines a pupil writes on get their own shortlist.
 *
 * `rule` is first because it is the role that exists for exactly this, and
 * `textMuted` is on the list because a teacher setting a paper for clasa a II-a
 * often wants the guide lines darker than a decorative border but lighter than
 * the text.
 */
const RULE_TOKENS: readonly BorrowableToken[] = [
  "rule",
  "border",
  "borderStrong",
  "textMuted",
  "accent",
];

export interface ThemeDetailFieldsProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeSpacingFields({
  theme,
  onChange,
}: ThemeDetailFieldsProps) {
  const { spacing } = theme;
  const write = (patch: Partial<Theme["spacing"]>) =>
    onChange({ ...theme, spacing: { ...spacing, ...patch } });

  return (
    <FieldGroup title={EVALUATION_COPY.groupSpacing}>
      <NumberField
        label={EVALUATION_COPY.fieldBlockGap}
        value={spacing.blockGapMm}
        min={0}
        max={20}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(blockGapMm) => write({ blockGapMm })}
      />
      <NumberField
        label={EVALUATION_COPY.fieldSectionGap}
        value={spacing.sectionGapMm}
        min={0}
        max={30}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(sectionGapMm) => write({ sectionGapMm })}
      />
      {/**
       * The default gutter only. `columnGapByLayout` is deliberately not
       * exposed: it is a sparse map of typographic corrections for the layouts
       * whose measure would otherwise collapse — four columns on A4 — and it is
       * the theme author's job, not a per-paper decision. A teacher who widens
       * this widens every layout that has not overridden it, which is what they
       * mean by "more space between the columns".
       */}
      <NumberField
        label={EVALUATION_COPY.fieldColumnGap}
        value={spacing.columnGapMm}
        min={0}
        max={20}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(columnGapMm) => write({ columnGapMm })}
      />
      <NumberField
        label={EVALUATION_COPY.fieldListIndent}
        value={spacing.listIndentMm}
        min={0}
        max={25}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(listIndentMm) => write({ listIndentMm })}
      />
      <NumberField
        label={EVALUATION_COPY.fieldParagraphSpacing}
        value={spacing.paragraphSpacingMm}
        min={0}
        max={15}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(paragraphSpacingMm) => write({ paragraphSpacingMm })}
      />
    </FieldGroup>
  );
}

export function ThemeFrameFields({ theme, onChange }: ThemeDetailFieldsProps) {
  const { borders, radius } = theme;

  return (
    <FieldGroup title={EVALUATION_COPY.groupFrames}>
      <NumberField
        label={EVALUATION_COPY.fieldHairline}
        value={borders.hairlineMm}
        min={0.1}
        max={1}
        step={0.05}
        unit="mm"
        decimals={2}
        onCommit={(hairlineMm) =>
          onChange({ ...theme, borders: { ...borders, hairlineMm } })
        }
      />
      <NumberField
        label={EVALUATION_COPY.fieldRegularLine}
        value={borders.regularMm}
        min={0.1}
        max={2}
        step={0.05}
        unit="mm"
        decimals={2}
        onCommit={(regularMm) =>
          onChange({ ...theme, borders: { ...borders, regularMm } })
        }
      />
      <NumberField
        label={EVALUATION_COPY.fieldThickLine}
        value={borders.thickMm}
        min={0.2}
        max={4}
        step={0.1}
        unit="mm"
        decimals={1}
        onCommit={(thickMm) =>
          onChange({ ...theme, borders: { ...borders, thickMm } })
        }
      />

      <ColorTokenField
        label={EVALUATION_COPY.fieldFrameColor}
        theme={theme}
        value={borders.defaultColor}
        options={FRAME_TOKENS}
        onChange={(defaultColor) =>
          onChange({ ...theme, borders: { ...borders, defaultColor } })
        }
      />

      {/**
       * `noneMm` is absent on purpose: it is zero by definition, and a slider
       * that lets a teacher set "no corner" to 3mm is a control that can make
       * the word on it false.
       */}
      <NumberField
        label={EVALUATION_COPY.fieldRadiusSmall}
        value={radius.smallMm}
        min={0}
        max={6}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(smallMm) =>
          onChange({ ...theme, radius: { ...radius, smallMm } })
        }
      />
      <NumberField
        label={EVALUATION_COPY.fieldRadiusMedium}
        value={radius.mediumMm}
        min={0}
        max={10}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(mediumMm) =>
          onChange({ ...theme, radius: { ...radius, mediumMm } })
        }
      />
      <NumberField
        label={EVALUATION_COPY.fieldRadiusLarge}
        value={radius.largeMm}
        min={0}
        max={16}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(largeMm) =>
          onChange({ ...theme, radius: { ...radius, largeMm } })
        }
      />
    </FieldGroup>
  );
}

export function ThemeExerciseFields({
  theme,
  onChange,
}: ThemeDetailFieldsProps) {
  const defaults = theme.exerciseDefaults;
  const group = useFieldId("numbering");
  const points = useFieldId("points");

  const write = (patch: Partial<Theme["exerciseDefaults"]>) =>
    onChange({ ...theme, exerciseDefaults: { ...defaults, ...patch } });

  return (
    <FieldGroup title={EVALUATION_COPY.groupExercises}>
      <Field label={EVALUATION_COPY.fieldNumbering}>
        <RadioGroup
          value={defaults.numbering}
          onValueChange={(next) => {
            const parsed = ExerciseNumbering.safeParse(next);
            if (parsed.success) write({ numbering: parsed.data });
          }}
        >
          {ExerciseNumbering.options.map((option) => (
            <div key={option} className="flex min-h-11 items-center gap-2">
              <RadioGroupItem id={`${group}-${option}`} value={option} />
              <Label htmlFor={`${group}-${option}`}>
                {EVALUATION_COPY.numbering[option]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Field>

      <div className="flex min-h-11 items-center justify-between gap-3">
        <Label htmlFor={points}>{EVALUATION_COPY.fieldShowPoints}</Label>
        <Switch
          id={points}
          checked={defaults.showPoints}
          onCheckedChange={(showPoints) => write({ showPoints })}
        />
      </div>

      {defaults.showPoints ? (
        <TextField
          label={EVALUATION_COPY.fieldPointsLabel}
          value={defaults.pointsLabel}
          maxLength={20}
          onCommit={(pointsLabel) => write({ pointsLabel })}
        />
      ) : null}

      <NumberField
        label={EVALUATION_COPY.fieldSpacingAbove}
        value={defaults.spacingAboveMm}
        min={0}
        max={25}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(spacingAboveMm) => write({ spacingAboveMm })}
      />
      <NumberField
        label={EVALUATION_COPY.fieldSpacingBelow}
        value={defaults.spacingBelowMm}
        min={0}
        max={25}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(spacingBelowMm) => write({ spacingBelowMm })}
      />

      <ColorTokenField
        label={EVALUATION_COPY.fieldRuleColor}
        theme={theme}
        value={defaults.answerRuleColor}
        options={RULE_TOKENS}
        onChange={(answerRuleColor) => write({ answerRuleColor })}
      />
      <NumberField
        label={EVALUATION_COPY.fieldRuleWidth}
        value={defaults.answerRuleWidthMm}
        min={0.1}
        max={1}
        step={0.05}
        unit="mm"
        decimals={2}
        onCommit={(answerRuleWidthMm) => write({ answerRuleWidthMm })}
      />
      {/**
       * The floor is 6mm rather than 0. Romanian primary-school ruled paper is
       * 8-9mm and a pupil in clasa a II-a cannot fit their letters between
       * anything tighter — the same measurement `default-theme.ts` argues for.
       * A slider that goes to zero offers a setting that produces a solid black
       * band on the printed page.
       */}
      <NumberField
        label={EVALUATION_COPY.fieldLineGap}
        value={defaults.answerLineGapMm}
        min={6}
        max={20}
        step={0.5}
        unit="mm"
        decimals={1}
        onCommit={(answerLineGapMm) => write({ answerLineGapMm })}
      />
    </FieldGroup>
  );
}
