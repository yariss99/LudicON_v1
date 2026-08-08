import { useState } from "react";
import { ColorToken, type HexColor, type Theme } from "@ludicon/evaluation";
import {
  Button,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Input,
  Label,
  ToggleGroup,
  ToggleGroupItem,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { judgeColor, type Swatch } from "./theme-palette";

/**
 * Choosing a colour for the paper: swatches first, typing second, no wheel.
 *
 * The whole rationale for the swatch set lives in `./theme-palette.ts`. What
 * this file owns is how the choice is DRAWN, and there is one rule behind every
 * decision in it: a colour control cannot signal its own state with colour.
 * Everyone using it is, by definition, looking at a grid of colours; a chosen
 * swatch that is merely tinted differently is invisible inside that grid, and
 * for anyone who cannot separate two hues it never existed.
 *
 * So chosen is a SHAPE. The chip shrinks and a ring appears around it with a
 * gap between the two, which is the affordance every paint program has used for
 * thirty years and which survives being printed in greyscale. `aria-pressed`
 * carries the same fact to a screen reader. The rejected alternatives were a
 * tick drawn over the chip — unreadable on a light swatch unless it is given an
 * outline, at which point it is a second shape fighting the first — and a
 * coloured border, which is the failure this paragraph exists to avoid.
 *
 * The chips themselves are painted with an inline literal, which is the same
 * exception `block-view.tsx` takes: this is the teacher's own colour, arriving
 * as data. A semantic token here would paint the swatch the wrong colour, which
 * is the one thing a swatch may not do.
 *
 * ## Typing a colour is a disclosure, not a field
 *
 * Most teachers will press a swatch and never open it. Leaving a hex box under
 * every colour would put six of them in the panel, each teaching that this is a
 * screen where you are expected to know what `#1d4ed8` means. Behind a
 * disclosure it is available to the school that has a crest in a specific
 * green, and invisible to everyone else.
 */

export interface ColorFieldProps {
  label: string;
  /** The colour in force, already resolved to a literal by the caller. */
  value: HexColor;
  swatches: readonly Swatch[];
  onChange: (hex: HexColor) => void;
}

export function ColorField({
  label,
  value,
  swatches,
  onChange,
}: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between gap-2">
        <Label>{label}</Label>
        <span className="text-sm tabular-nums text-muted-foreground">
          {value}
        </span>
      </div>

      <div className="flex flex-wrap gap-0.5">
        {swatches.map((one) => (
          <SwatchButton
            key={one.hex}
            swatch={one}
            chosen={one.hex.toLowerCase() === value.toLowerCase()}
            onChoose={() => onChange(one.hex)}
          />
        ))}
      </div>

      <CustomColor current={value} onChange={onChange} />
    </div>
  );
}

/**
 * One swatch.
 *
 * The button is 44px because CH07 says every target is, and the chip inside it
 * is 24px because a 44px block of colour beside eight others is a wall rather
 * than a palette. The padding is the target; the paint is the value.
 */
function SwatchButton({
  swatch,
  chosen,
  onChoose,
}: {
  swatch: Swatch;
  chosen: boolean;
  onChoose: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={chosen}
      aria-label={EVALUATION_COPY.colorSwatch(swatch.name)}
      title={swatch.name}
      onClick={onChoose}
      className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md"
    >
      <span
        aria-hidden
        style={{ backgroundColor: swatch.hex }}
        className={
          chosen
            ? "size-4.5 rounded-full ring-2 ring-primary ring-offset-2 ring-offset-panel"
            : "size-6 rounded-full ring-1 ring-border-strong transition-[width,height] duration-[var(--motion-fast)] ease-standard"
        }
      />
    </button>
  );
}

/**
 * The roles a frame or a writing line may borrow.
 *
 * Narrowed to the keys `copy.ts` actually names, so adding an option to
 * one of the two lists without giving it a Romanian word is a type error rather
 * than an English token name reaching a teacher.
 */
export type BorrowableToken = keyof typeof EVALUATION_COPY.tokenName;

export interface ColorTokenFieldProps {
  label: string;
  theme: Theme;
  value: ColorToken;
  /** The handful of roles this line is allowed to borrow, in order. */
  options: readonly BorrowableToken[];
  onChange: (token: ColorToken) => void;
}

/**
 * Picking a ROLE rather than a colour.
 *
 * Two fields in the theme — the default frame colour and the colour of the
 * lines a pupil writes on — are `ColorToken`, not `HexColor`, and the
 * difference is the whole point of the token layer: a rule that says `"rule"`
 * follows the theme when the theme changes, and a rule that says `#94a3b8` has
 * opted out for good. Offering a hex here would silently convert every paper
 * that touched the control into one that no longer re-themes.
 *
 * So the control is a short list of roles, each showing the colour it currently
 * resolves to. The chosen one is the segmented control's own pill — a shape
 * plus `aria-pressed`, which is the same reason `ToggleGroup` is used for
 * alignment one panel over.
 */
export function ColorTokenField({
  label,
  theme,
  value,
  options,
  onChange,
}: ColorTokenFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      <ToggleGroup
        type="single"
        wrap
        value={value}
        onValueChange={(next) => {
          const parsed = ColorToken.safeParse(next);
          if (parsed.success) onChange(parsed.data);
        }}
      >
        {options.map((token) => (
          <ToggleGroupItem key={token} value={token} className="gap-2 px-3">
            <span
              aria-hidden
              style={{ backgroundColor: theme.colors[token] }}
              className="size-4 shrink-0 rounded-full ring-1 ring-border-strong"
            />
            <span className="text-sm">{EVALUATION_COPY.tokenName[token]}</span>
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}

/**
 * The typed colour, and what happens when the guard turns it down.
 *
 * The draft is kept locally and only a passing colour reaches the document, so
 * a half-typed `#2` never becomes a command and never becomes an undo step. The
 * refusal is a sentence under the field rather than a toast: a toast for a rule
 * the teacher is about to hit again is a rule they have to remember, and this
 * one stays on screen next to the box that caused it.
 *
 * `aria-live="polite"` because the message appears without focus moving — the
 * press is on the button, the answer is below the input.
 */
function CustomColor({
  current,
  onChange,
}: {
  current: HexColor;
  onChange: (hex: HexColor) => void;
}) {
  const [draft, setDraft] = useState("");
  const [refused, setRefused] = useState<"shape" | "banned" | null>(null);

  const submit = () => {
    const outcome = judgeColor(draft);
    if (!outcome.ok) {
      setRefused(outcome.reason);
      return;
    }
    setRefused(null);
    setDraft("");
    if (outcome.hex.toLowerCase() !== current.toLowerCase()) {
      onChange(outcome.hex);
    }
  };

  return (
    <Collapsible>
      <CollapsibleTrigger className="text-sm font-normal text-muted-foreground">
        {EVALUATION_COPY.colorCustom}
      </CollapsibleTrigger>
      <CollapsibleContent className="flex flex-col gap-2 pt-0 pb-1">
        <div className="flex items-center gap-2">
          <Input
            value={draft}
            spellCheck={false}
            autoComplete="off"
            placeholder={EVALUATION_COPY.colorCustomPlaceholder}
            aria-label={EVALUATION_COPY.colorCustom}
            className="font-mono tabular-nums"
            onChange={(event) => {
              setDraft(event.target.value);
              setRefused(null);
            }}
            onKeyDown={(event) => {
              if (event.key !== "Enter") return;
              event.preventDefault();
              submit();
            }}
          />
          <Button variant="secondary" size="sm" onClick={submit}>
            {EVALUATION_COPY.colorApply}
          </Button>
        </div>

        <p
          aria-live="polite"
          className="text-sm leading-[1.5] text-muted-foreground"
        >
          {refused === "banned"
            ? EVALUATION_COPY.colorRefusedBanned
            : refused === "shape"
              ? EVALUATION_COPY.colorRefusedShape
              : EVALUATION_COPY.colorCustomHint}
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
