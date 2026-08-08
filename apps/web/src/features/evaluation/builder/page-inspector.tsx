import { useState } from "react";
import {
  resolveColor,
  type HexColor,
  type Page,
  type PageBackground,
  type PageGradient,
  type Theme,
} from "@ludicon/evaluation";
import { Label, RadioGroup, RadioGroupItem, Switch } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { applyPageSettings } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { ColorField } from "./color-field";
import { Field, FieldGroup, NumberField, useFieldId } from "./inspector-field";
import { GradientFields, ImageFields } from "./page-background-fields";
import { PAGE_SWATCHES } from "./theme-palette";

/**
 * One sheet's own settings: what is behind the text, and whether pieces may be
 * placed by eye.
 *
 * Everything here writes a whole `Page` through `applyPageSettings`, which is
 * `updatePage` through `applyCommand`. The page is SPREAD rather than
 * assembled: `sectionOrder` lives on the same record, so building a fresh page
 * object here would drop every row that landed on the sheet since this panel
 * rendered.
 *
 * ## Four states, one of which is "nothing"
 *
 * `page.background` is nullable and the null is meaningful — it is the sheet
 * saying "whatever the theme says", which is what makes re-theming a paper
 * actually change its pages. A page carrying a record of nulls would look
 * identical and would no longer be inheriting. So the radio group's first
 * option writes `null` rather than an object full of nulls, and `normalise`
 * puts a record that has been emptied back to `null` as well.
 *
 * Which of the four is chosen is therefore LOCAL STATE laid over what the
 * record says, and that is not a shortcut. The record has no field for "the
 * teacher wants an image", only for the image itself, so a radio derived purely
 * from the record snapped straight back to "O culoare" the moment "O imagine"
 * was pressed — the address box had not been filled in yet, so as far as the
 * document was concerned nothing had happened. The state resets per sheet
 * because `inspector-panel.tsx` keys this component on the page id.
 *
 * The three that carry content are kept EXCLUSIVE by `onlyKind`: writing a
 * colour clears the gradient and the image, and so on round. The schema lets
 * all three coexist on purpose — see `packages/evaluation/src/model/page.ts` —
 * so that pressing an option to see what it offers does not throw away the
 * green a teacher spent a minute choosing. The clearing happens on the FIELD as
 * it writes, which is the moment they have actually said what replaces it.
 *
 * ## Why the gradient is here and the hue wheel still is not
 *
 * §7 of the brief asks for gradients and for an image's fit and position, and
 * the model now carries all three. Every colour reachable from this panel still
 * goes through the same two gates the flat colour always did: the swatch set is
 * `PAGE_SWATCHES`, all of it legal, and the typed-colour disclosure inside
 * `ColorField` runs `judgeColor`, which is `isForbiddenBrandHue` plus the
 * six-digit shape check. A gradient is two colours, so it is two passes through
 * the same guard rather than a way around it.
 *
 * The controls arrive in layers rather than all at once. The radio is four
 * options; each discloses only its own fields, an image's fit and position
 * appear only once there is an address to place, and a gradient running outward
 * from the middle shows no direction. That is the design book's "not a
 * word-processor ribbon of 40 tools" applied to the one panel that could most
 * easily become one.
 */

type BackgroundKind = "theme" | "color" | "gradient" | "image";

const KIND_ORDER: readonly BackgroundKind[] = [
  "theme",
  "color",
  "gradient",
  "image",
];

/** The record a sheet starts from the first time it is given a background. */
const BLANK: PageBackground = Object.freeze({
  color: null,
  gradient: null,
  imageSrc: null,
  imageFit: "cover",
  imagePosition: "center",
  opacity: 1,
});

/**
 * The gradient a teacher gets before they have chosen anything.
 *
 * Both stops name THEME TOKENS rather than hexes, so an untouched gradient
 * still follows the paper when the theme changes — the same bargain every other
 * colour in the model strikes. Pressing a swatch opts that stop out, which is
 * what opting out means everywhere else too.
 *
 * A function and not a constant: the stops are an array, and one shared array
 * is one missed spread away from two sheets editing the same gradient.
 */
const freshGradient = (): PageGradient => ({
  kind: "linear",
  angleDeg: 180,
  stops: [
    { color: "background", at: 0 },
    { color: "surface", at: 100 },
  ],
});

const kindOf = (background: PageBackground | null): BackgroundKind => {
  if (!background) return "theme";
  if (background.imageSrc) return "image";
  if (background.gradient) return "gradient";
  if (background.color) return "color";
  return "theme";
};

export interface PageInspectorProps {
  page: Page;
}

export function PageInspector({ page }: PageInspectorProps) {
  const store = useEditorStore();
  const theme = useEditor((state) => state.document.theme);
  const ids = useFieldId("page");

  const background = page.background;
  const [wanted, setWanted] = useState<BackgroundKind | null>(null);
  const kind = wanted ?? kindOf(background);

  const writePage = (next: Page) => applyPageSettings(store, next);

  /**
   * Nothing is written unless something actually changed.
   *
   * `updatePage` has no equality guard of its own — it cannot, since a page it
   * was handed is by definition what the caller wants — so an unchanged write
   * would land a history step that a press of ⌘Z undoes invisibly. Pressing the
   * radio option that is already chosen is exactly that press.
   */
  const writeBackground = (next: PageBackground | null) => {
    if (sameBackground(background, next)) return;
    writePage({ ...page, background: next });
  };

  return (
    <div className="flex flex-col pb-4">
      <FieldGroup title={EVALUATION_COPY.groupPageBackground} defaultOpen>
        <Field label={EVALUATION_COPY.fieldBackgroundKind}>
          <RadioGroup
            value={kind}
            onValueChange={(next) => {
              const chosen = next as BackgroundKind;
              setWanted(chosen);
              writeBackground(switchKind(chosen, background));
            }}
          >
            {KIND_ORDER.map((option) => (
              <div key={option} className="flex min-h-11 items-center gap-2">
                <RadioGroupItem id={`${ids}-${option}`} value={option} />
                <Label htmlFor={`${ids}-${option}`}>
                  {EVALUATION_COPY.backgroundKind[option]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>

        {kind === "color" ? (
          <ColorField
            label={EVALUATION_COPY.fieldBackgroundColor}
            value={paperOf(theme, background)}
            swatches={PAGE_SWATCHES}
            onChange={(color) =>
              writeBackground(
                onlyKind("color", { ...(background ?? BLANK), color }),
              )
            }
          />
        ) : null}

        {kind === "gradient" ? (
          <GradientFields
            theme={theme}
            gradient={background?.gradient ?? freshGradient()}
            onChange={(gradient) =>
              writeBackground(
                onlyKind("gradient", { ...(background ?? BLANK), gradient }),
              )
            }
          />
        ) : null}

        {kind === "image" ? (
          <ImageFields
            image={{
              imageSrc: background?.imageSrc ?? null,
              imageFit: background?.imageFit ?? BLANK.imageFit,
              imagePosition: background?.imagePosition ?? BLANK.imagePosition,
            }}
            onChange={(image) =>
              writeBackground(
                normalise(
                  onlyKind("image", { ...(background ?? BLANK), ...image }),
                ),
              )
            }
          />
        ) : null}

        {/**
         * Opacity is shown for a colour and a gradient as well as for an image,
         * because it is one field on one record and hiding it would be the
         * panel claiming the setting does not apply when it plainly does — a
         * pale wash of the chosen colour is exactly what a teacher tinting a
         * cover is after.
         *
         * It is read and written as a percentage and stored as 0-1, because
         * "40%" is what a teacher says and `0.4` is what the schema takes.
         */}
        {kind !== "theme" ? (
          <NumberField
            label={EVALUATION_COPY.fieldBackgroundOpacity}
            value={Math.round((background?.opacity ?? 1) * 100)}
            min={5}
            max={100}
            step={5}
            unit="%"
            onCommit={(percent) =>
              writeBackground({
                ...(background ?? BLANK),
                opacity: percent / 100,
              })
            }
          />
        ) : null}
      </FieldGroup>

      <div className="flex flex-col gap-1.5 px-4 py-4">
        <div className="flex min-h-11 items-center justify-between gap-3">
          <Label htmlFor={`${ids}-placement`}>
            {EVALUATION_COPY.fieldFreePlacement}
          </Label>
          <Switch
            id={`${ids}-placement`}
            checked={page.allowsFreePlacement}
            onCheckedChange={(allowsFreePlacement) =>
              writePage({ ...page, allowsFreePlacement })
            }
          />
        </div>
        <p className="text-sm leading-[1.5] text-muted-foreground">
          {EVALUATION_COPY.fieldFreePlacementHint}
        </p>
      </div>
    </div>
  );
}

/** Whether a record has anything in the field one of the three kinds owns. */
const hasContent = (
  kind: Exclude<BackgroundKind, "theme">,
  background: PageBackground,
): boolean =>
  kind === "color"
    ? background.color !== null
    : kind === "gradient"
      ? background.gradient !== null
      : background.imageSrc !== null;

/**
 * The record with one kind kept and the other two cleared.
 *
 * Called by the FIELDS as they write, never by the radio. Everything a teacher
 * has typed or picked survives until they replace it, and what is stored still
 * has exactly one answer to "what is behind this sheet" — which is what lets
 * `page-view.tsx` paint without inventing an order between a colour, a gradient
 * and an image that could otherwise all be present at once.
 */
const onlyKind = (
  kind: Exclude<BackgroundKind, "theme">,
  background: PageBackground,
): PageBackground => ({
  ...background,
  color: kind === "color" ? background.color : null,
  gradient: kind === "gradient" ? background.gradient : null,
  imageSrc: kind === "image" ? background.imageSrc : null,
});

/**
 * A record with nothing in it is the same thing as no record.
 *
 * Clearing the address is the case this exists for: the sheet is back to
 * following the theme, and leaving `{ …all null, opacity: 0.4 }` behind would
 * be a page that no longer inherits and cannot be seen to differ.
 */
const normalise = (background: PageBackground): PageBackground | null =>
  background.color === null &&
  background.gradient === null &&
  background.imageSrc === null
    ? null
    : background;

/**
 * What the record becomes when the teacher picks one of the four.
 *
 * "Ca restul lucrării" writes `null` — see the note at the top about why an
 * object full of nulls is not the same thing.
 *
 * Picking a kind with nothing to put in it yet leaves the record ALONE — it
 * returns what it was handed, and `sameBackground` then declines to write. The
 * teacher has said "I want an image", not "I have one", and neither a stored
 * background of nulls nor a discarded colour is a fair reading of that press.
 * The fields do the clearing, when there is finally something to clear it for.
 */
const switchKind = (
  kind: BackgroundKind,
  current: PageBackground | null,
): PageBackground | null => {
  if (kind === "theme" || current === null) return null;
  return hasContent(kind, current) ? onlyKind(kind, current) : current;
};

const sameGradient = (
  a: PageGradient | null,
  b: PageGradient | null,
): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.kind === b.kind &&
    a.angleDeg === b.angleDeg &&
    a.stops.length === b.stops.length &&
    a.stops.every((stop, at) => {
      const other = b.stops[at];
      return (
        other !== undefined &&
        stop.color === other.color &&
        stop.at === other.at
      );
    }));

const sameBackground = (
  a: PageBackground | null,
  b: PageBackground | null,
): boolean =>
  a === b ||
  (a !== null &&
    b !== null &&
    a.color === b.color &&
    a.imageSrc === b.imageSrc &&
    a.imageFit === b.imageFit &&
    a.imagePosition === b.imagePosition &&
    a.opacity === b.opacity &&
    sameGradient(a.gradient, b.gradient));

/** What the colour swatches should show as chosen, resolved through the theme. */
const paperOf = (theme: Theme, background: PageBackground | null): HexColor =>
  background?.color
    ? resolveColor(theme, background.color)
    : resolveColor(theme, "background");
