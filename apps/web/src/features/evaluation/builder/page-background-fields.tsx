import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  type LucideIcon,
} from "lucide-react";
import {
  PageImageFit,
  PageImagePosition,
  resolveColor,
  type GradientKind,
  type HexColor,
  type PageGradient,
  type Theme,
} from "@ludicon/evaluation";
import {
  Label,
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { ColorField } from "./color-field";
import { Field, TextField, useFieldId } from "./inspector-field";
import { PAGE_SWATCHES } from "./theme-palette";

/**
 * The two backgrounds that need more than one answer: a gradient, and an image
 * that is not the same shape as the sheet.
 *
 * Split out of `page-inspector.tsx` for the reason `theme-detail-fields.tsx`
 * was split out of `theme-inspector.tsx`: the parent's job is the four-way
 * choice and the record arithmetic that keeps the four exclusive, and burying
 * eleven controls in the middle of that makes the arithmetic unreadable.
 * Nothing here writes to the store — each half is handed what it edits and a
 * callback, so the rule that a page is written whole, once, through
 * `applyPageSettings`, stays stated in exactly one place.
 *
 * ## Every colour offered here is already legal
 *
 * A gradient is two colours, so it is two more chances to put indigo on a
 * teacher's paper. Both go through `ColorField` with `PAGE_SWATCHES`, which is
 * the paper-tint set — every hex in it passes `isForbiddenBrandHue` — and its
 * typed-colour disclosure runs `judgeColor`, which is that guard plus the
 * six-digit shape check. There is no hue wheel here for the same reason there
 * is none anywhere: `theme-palette.ts` argues it at length, and a control that
 * offers 360 degrees and refuses 78 of them teaches a teacher the product is
 * broken.
 *
 * ## Why the direction is four arrows and not a dial
 *
 * `angleDeg` can hold any of 360 values and the panel offers four, which is the
 * same bargain the swatches strike. A dial is a fiddly target that produces
 * 173° — a number no teacher meant and every reviewer notices. The four that
 * are drawn are the four a page background is ever asked for, and the arrows
 * are the picture of the answer; the Romanian names are each item's accessible
 * name, exactly as the alignment icons in `block-inspector.tsx` work.
 */

const FIT_ORDER = PageImageFit.options;
const POSITION_ORDER = PageImagePosition.options;

/** CSS's own convention: 0° runs upward, 180° downward. */
const DIRECTION_ANGLE = Object.freeze({
  down: 180,
  up: 0,
  right: 90,
  left: 270,
});

type Direction = keyof typeof DIRECTION_ANGLE;

const DIRECTION_ORDER: readonly Direction[] = ["down", "up", "right", "left"];

const DIRECTION_ICON: Readonly<Record<Direction, LucideIcon>> = Object.freeze({
  down: ArrowDown,
  up: ArrowUp,
  right: ArrowRight,
  left: ArrowLeft,
});

const directionOf = (angleDeg: number): Direction | undefined =>
  DIRECTION_ORDER.find((one) => DIRECTION_ANGLE[one] === angleDeg);

export interface GradientFieldsProps {
  theme: Theme;
  gradient: PageGradient;
  onChange: (gradient: PageGradient) => void;
}

/**
 * A gradient, as two colours and where they run.
 *
 * Two stops and not the four the schema permits. A third stop is a control that
 * has to be added, moved and removed, and a page background with three is past
 * what this is for — the schema keeps the room because a stop list is the
 * honest shape, and the panel offers the pair that covers the case.
 *
 * The stops keep their stored positions rather than being pinned to 0 and 100,
 * so a record written by hand or by a future control survives being edited
 * here: only the colour of each is replaced.
 */
export function GradientFields({
  theme,
  gradient,
  onChange,
}: GradientFieldsProps) {
  const ids = useFieldId("gradient");
  const [from, to] = gradient.stops;
  const direction = directionOf(gradient.angleDeg);

  const paint = (index: number, color: HexColor) =>
    onChange({
      ...gradient,
      stops: gradient.stops.map((stop, at) =>
        at === index ? { ...stop, color } : stop,
      ),
    });

  return (
    <>
      <Field label={EVALUATION_COPY.fieldGradientShape}>
        <RadioGroup
          value={gradient.kind}
          onValueChange={(next) =>
            onChange({ ...gradient, kind: next as GradientKind })
          }
        >
          {(["linear", "radial"] as const).map((option) => (
            <div key={option} className="flex min-h-11 items-center gap-2">
              <RadioGroupItem id={`${ids}-${option}`} value={option} />
              <Label htmlFor={`${ids}-${option}`}>
                {EVALUATION_COPY.gradientShape[option]}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </Field>

      {/* A circle running outward from the middle has no direction to set, so
          the control is absent rather than disabled — a disabled field is a
          promise about something this shape cannot express. */}
      {gradient.kind === "linear" ? (
        <Field label={EVALUATION_COPY.fieldGradientDirection}>
          <ToggleGroup
            type="single"
            value={direction ?? ""}
            onValueChange={(next) => {
              const chosen = DIRECTION_ORDER.find((one) => one === next);
              if (!chosen) return;
              onChange({ ...gradient, angleDeg: DIRECTION_ANGLE[chosen] });
            }}
          >
            {DIRECTION_ORDER.map((one) => {
              const Icon = DIRECTION_ICON[one];
              return (
                <ToggleGroupItem
                  key={one}
                  value={one}
                  aria-label={EVALUATION_COPY.gradientDirection[one]}
                  className="px-0"
                >
                  <Icon aria-hidden strokeWidth={1.75} />
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Field>
      ) : null}

      {from ? (
        <ColorField
          label={EVALUATION_COPY.fieldGradientFrom}
          value={resolveColor(theme, from.color)}
          swatches={PAGE_SWATCHES}
          onChange={(color) => paint(0, color)}
        />
      ) : null}

      {to ? (
        <ColorField
          label={EVALUATION_COPY.fieldGradientTo}
          value={resolveColor(theme, to.color)}
          swatches={PAGE_SWATCHES}
          onChange={(color) => paint(1, color)}
        />
      ) : null}
    </>
  );
}

export interface PageImageSettings {
  readonly imageSrc: string | null;
  readonly imageFit: PageImageFit;
  readonly imagePosition: PageImagePosition;
}

export interface ImageFieldsProps {
  image: PageImageSettings;
  onChange: (image: PageImageSettings) => void;
}

/**
 * An image, and the two questions a sheet it does not fit asks.
 *
 * The address commits on blur or Enter rather than on every keystroke — see
 * `TextField` in `./inspector-field.tsx` for why one change has to be one press
 * of ⌘Z.
 *
 * Where the image sits is only asked once there is an image to place. Asking
 * first is a panel of settings for something that does not exist, and the
 * teacher has nothing on screen to judge the answer against.
 */
export function ImageFields({ image, onChange }: ImageFieldsProps) {
  const ids = useFieldId("image");

  return (
    <>
      <TextField
        label={EVALUATION_COPY.fieldBackgroundImage}
        value={image.imageSrc ?? ""}
        hint={EVALUATION_COPY.fieldBackgroundImageHint}
        maxLength={4000}
        onCommit={(typed) => {
          const imageSrc = typed.trim();
          onChange({ ...image, imageSrc: imageSrc === "" ? null : imageSrc });
        }}
      />

      {image.imageSrc ? (
        <Field label={EVALUATION_COPY.fieldImageFit}>
          <RadioGroup
            value={image.imageFit}
            onValueChange={(next) => {
              const parsed = PageImageFit.safeParse(next);
              if (parsed.success) onChange({ ...image, imageFit: parsed.data });
            }}
          >
            {FIT_ORDER.map((option) => (
              <div key={option} className="flex min-h-11 items-center gap-2">
                <RadioGroupItem id={`${ids}-${option}`} value={option} />
                <Label htmlFor={`${ids}-${option}`}>
                  {EVALUATION_COPY.imageFit[option]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>
      ) : null}

      {/* A mozaic starts at the corner and repeats to the edges, so where it
          "sits" is a distinction with no visible difference on a full sheet.
          The control is absent for it rather than present and inert. */}
      {image.imageSrc && image.imageFit !== "tile" ? (
        <Field label={EVALUATION_COPY.fieldImagePosition}>
          <AnchorGrid
            value={image.imagePosition}
            onChange={(imagePosition) => onChange({ ...image, imagePosition })}
          />
        </Field>
      ) : null}
    </>
  );
}

/**
 * Nine anchors, drawn as the nine places they mean.
 *
 * The grid IS the answer: which cell is filled says where the image goes, in a
 * way no list of nine Romanian phrases does at a glance. Chosen is a SHAPE —
 * the dot grows and takes a ring, with `aria-pressed` carrying the same fact —
 * for the reason `color-field.tsx` gives at length: a control whose state is
 * only a colour has no state for anyone who cannot separate two of them.
 *
 * Each cell is 44px because CH07 says every target is; the dot inside is small
 * because nine 44px blocks of ink is a wall rather than a diagram.
 */
function AnchorGrid({
  value,
  onChange,
}: {
  value: PageImagePosition;
  onChange: (position: PageImagePosition) => void;
}) {
  return (
    <div className="grid w-fit grid-cols-3 gap-0.5 rounded-md ring-1 ring-border">
      {POSITION_ORDER.map((position) => {
        const chosen = position === value;
        return (
          <button
            key={position}
            type="button"
            aria-pressed={chosen}
            aria-label={EVALUATION_COPY.imagePosition[position]}
            title={EVALUATION_COPY.imagePosition[position]}
            onClick={() => onChange(position)}
            className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md"
          >
            <span
              aria-hidden
              className={
                chosen
                  ? "size-3 rounded-full bg-primary ring-2 ring-primary ring-offset-2 ring-offset-panel"
                  : "size-2 rounded-full bg-border-strong transition-[width,height] duration-[var(--motion-fast)] ease-standard"
              }
            />
          </button>
        );
      })}
    </div>
  );
}
