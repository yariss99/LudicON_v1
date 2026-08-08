import {
  TypographySlot,
  type Theme,
  type TypographyStep,
} from "@ludicon/evaluation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { Field, FieldGroup, NumberField } from "./inspector-field";

/**
 * How the paper is set: the letter, the size of the text, and — behind a
 * disclosure — every step of the scale.
 *
 * The split is the whole design of this group. Nine papers in ten need two
 * decisions, "which letter" and "how big is the text", and those two are
 * visible. The other twelve controls set the six steps of the type scale
 * individually and are one press away, because a teacher who wants their h2 a
 * point smaller is a real teacher and a teacher who meets twelve size sliders
 * on arrival is a teacher who closes the panel.
 *
 * ## Three letters, not a font menu
 *
 * The stacks are the product's own — `--font-sans`, `--font-display` and
 * `--font-mono` from `packages/ui/src/styles/theme.css`, which CH01 §5.1
 * mandates and which `apps/web/src/main.tsx` actually loads. Writing the family
 * names out rather than reading the custom properties is deliberate: the value
 * is stored in the DOCUMENT and travels to the PDF worker, which has no
 * stylesheet to resolve `var(--font-sans)` against. A `var()` in
 * `theme.typography.fontFamily` would render on screen and print as the
 * browser's default.
 *
 * ## Line height is only offered on the body
 *
 * Every slot has its own `lineHeight` in the model and only one of them decides
 * how much fits on A4. Six leading sliders would be six chances to make a
 * heading collide with the paragraph above it for no gain a teacher can see;
 * the heading leadings are the theme's, chosen against the sizes they ship with.
 */

const FONT_STACKS = Object.freeze({
  sans: '"Source Sans 3 Variable", "Source Sans 3", "Segoe UI", ui-sans-serif, system-ui, sans-serif',
  serif:
    '"Source Serif 4 Variable", "Source Serif 4", Georgia, ui-serif, serif',
  mono: '"IBM Plex Mono", ui-monospace, SFMono-Regular, monospace',
});

type FontKey = keyof typeof FONT_STACKS;
const FONT_KEYS = Object.keys(FONT_STACKS) as FontKey[];

/**
 * Which of the three a stored stack is.
 *
 * Matched on the FIRST family rather than on the whole string, so a paper saved
 * before a fallback was added to the stack still shows its letter as chosen
 * rather than showing nothing chosen at all. A paper carrying a family none of
 * the three name — imported, or written by hand — matches nothing, and the
 * control correctly shows no answer rather than inventing one.
 */
const fontKeyOf = (stack: string): FontKey | undefined =>
  FONT_KEYS.find(
    (key) =>
      FONT_STACKS[key].split(",")[0]?.trim() === stack.split(",")[0]?.trim(),
  );

/** 400 / 600 / 700, which is every weight the six theme steps actually use. */
const WEIGHTS = Object.freeze([
  { value: 400, label: EVALUATION_COPY.weightName.regular },
  { value: 600, label: EVALUATION_COPY.weightName.medium },
  { value: 700, label: EVALUATION_COPY.weightName.bold },
]);

export interface ThemeTypeFieldsProps {
  theme: Theme;
  onChange: (theme: Theme) => void;
}

export function ThemeTypeFields({ theme, onChange }: ThemeTypeFieldsProps) {
  const { scale } = theme.typography;

  const writeStep = (slot: TypographySlot, step: Partial<TypographyStep>) =>
    onChange({
      ...theme,
      typography: {
        ...theme.typography,
        scale: { ...scale, [slot]: { ...scale[slot], ...step } },
      },
    });

  return (
    <FieldGroup title={EVALUATION_COPY.groupTypography} defaultOpen>
      <Field label={EVALUATION_COPY.fieldFont}>
        <ToggleGroup
          type="single"
          wrap
          value={fontKeyOf(theme.typography.fontFamily) ?? ""}
          onValueChange={(next) => {
            if (!next || !(next in FONT_STACKS)) return;
            onChange({
              ...theme,
              typography: {
                ...theme.typography,
                fontFamily: FONT_STACKS[next as FontKey],
              },
            });
          }}
        >
          {FONT_KEYS.map((key) => (
            <ToggleGroupItem key={key} value={key} className="px-3">
              {/* Each option is set in the letter it offers. The name alone is
                  a promise; the shape of the word is the thing being chosen. */}
              <span style={{ fontFamily: FONT_STACKS[key] }}>
                {EVALUATION_COPY.fontName[key]}
              </span>
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </Field>

      <NumberField
        label={EVALUATION_COPY.fieldBodySize}
        value={scale.body.sizePt}
        min={8}
        max={16}
        step={0.5}
        unit="pt"
        decimals={1}
        onCommit={(sizePt) => writeStep("body", { sizePt })}
      />

      <NumberField
        label={EVALUATION_COPY.fieldLeading}
        value={scale.body.lineHeight}
        min={1}
        max={2}
        step={0.05}
        decimals={2}
        onCommit={(lineHeight) => writeStep("body", { lineHeight })}
      />

      <Collapsible>
        <CollapsibleTrigger className="text-sm font-normal text-muted-foreground">
          {EVALUATION_COPY.groupMoreSizes}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-5 pt-1 pb-1">
          {TypographySlot.options.map((slot) => (
            <SlotFields
              key={slot}
              slot={slot}
              step={scale[slot]}
              onChange={(next) => writeStep(slot, next)}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </FieldGroup>
  );
}

/** One step of the scale: how big, and how heavy. */
function SlotFields({
  slot,
  step,
  onChange,
}: {
  slot: TypographySlot;
  step: TypographyStep;
  onChange: (step: Partial<TypographyStep>) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5 border-l-2 border-border pl-3">
      {/* The slot's name is the size row's label and is not repeated over the
          weight row — two identical labels an inch apart is a screen reader
          hearing "Titlu mare" twice and a teacher wondering which one is which.
          The weight group carries the pairing as its accessible name instead. */}
      <NumberField
        label={EVALUATION_COPY.slotName[slot]}
        value={step.sizePt}
        min={6}
        max={48}
        step={0.5}
        unit="pt"
        decimals={1}
        onCommit={(sizePt) => onChange({ sizePt })}
      />

      {/**
       * Weight is a segmented control and the OPTIONS are not set in the weight
       * they name. Every other control in this panel previews itself; this one
       * must not, because the design system's rule is that a label's weight
       * never changes with its state — three options at three weights would put
       * three different label weights in one row and make the pressed one
       * measure differently from its neighbours.
       */}
      <ToggleGroup
        type="single"
        wrap
        aria-label={`${EVALUATION_COPY.slotName[slot]} — ${EVALUATION_COPY.fieldWeight}`}
        value={String(step.weight)}
        onValueChange={(next) => {
          const weight = Number(next);
          if (Number.isFinite(weight) && weight > 0) onChange({ weight });
        }}
      >
        {WEIGHTS.map((weight) => (
          <ToggleGroupItem
            key={weight.value}
            value={String(weight.value)}
            className="px-3 text-sm"
          >
            {weight.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
