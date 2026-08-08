import type { ColorToken, HexColor, Theme } from "@ludicon/evaluation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { applyTheme } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { ColorField } from "./color-field";
import { FieldGroup } from "./inspector-field";
import { EDITABLE_COLOR_TOKENS, swatchesFor } from "./theme-palette";
import {
  ThemeExerciseFields,
  ThemeFrameFields,
  ThemeSpacingFields,
} from "./theme-detail-fields";
import { ThemeTypeFields } from "./theme-type-fields";

/**
 * How the whole paper looks, when no single piece is chosen.
 *
 * This is where the inspector used to say "Nu ai ales nimic" and stop. That
 * sentence was true and it was also the only thing on screen for a teacher who
 * had just opened a paper, in a panel four hundred pixels tall. The theme is
 * exactly the setting that applies when nothing in particular is selected, so
 * it is what belongs here — and the sentence stays, at the top, doing the job
 * it was actually good at: saying that choosing a piece changes what this panel
 * shows.
 *
 * Every control builds a whole `Theme` and hands it to `applyTheme`, which is
 * `setTheme` through `applyCommand`. One field changed is one command and one
 * press of ⌘Z, and the reason a theme swap re-colours a paper at all is that
 * blocks store TOKEN names — see `packages/evaluation/src/theme/color.ts`. A
 * block the teacher recoloured by hand keeps its colour, because that is what
 * opting out means.
 *
 * ## Six colours, and eight that are not offered
 *
 * The accent is alone at the top and the other five are behind a disclosure,
 * because "make the headings green" is a thing teachers do and "change the
 * colour of the box fills" is a thing theme authors do.
 *
 * The eight callout tokens are absent entirely; `./theme-palette.ts` argues
 * that at length. The short version is that `calloutDanger` is red because it
 * MEANS careful, and a control that lets it be green produces a paper whose
 * colours lie to a pupil who has no legend to check them against.
 */

export function ThemeInspector() {
  const store = useEditorStore();
  const theme = useEditor((state) => state.document.theme);
  const write = (next: Theme) => applyTheme(store, next);

  return (
    <div className="flex flex-col pb-4">
      <p className="px-4 pt-4 pb-3 text-base leading-[1.6] text-muted-foreground">
        {EVALUATION_COPY.themeLead}
      </p>

      <ThemeColorFields theme={theme} onChange={write} />
      <ThemeTypeFields theme={theme} onChange={write} />
      <ThemeSpacingFields theme={theme} onChange={write} />
      <ThemeFrameFields theme={theme} onChange={write} />
      <ThemeExerciseFields theme={theme} onChange={write} />
    </div>
  );
}

const [ACCENT, ...REST] = EDITABLE_COLOR_TOKENS;

function ThemeColorFields({
  theme,
  onChange,
}: {
  theme: Theme;
  onChange: (theme: Theme) => void;
}) {
  const write = (token: ColorToken, hex: HexColor) =>
    onChange({ ...theme, colors: { ...theme.colors, [token]: hex } });

  return (
    <FieldGroup title={EVALUATION_COPY.groupColors} defaultOpen>
      {ACCENT ? (
        <TokenField token={ACCENT} theme={theme} onWrite={write} />
      ) : null}

      <Collapsible>
        <CollapsibleTrigger className="text-sm font-normal text-muted-foreground">
          {EVALUATION_COPY.groupMoreColors}
        </CollapsibleTrigger>
        <CollapsibleContent className="flex flex-col gap-5 pt-1 pb-1">
          {REST.map((token) => (
            <TokenField
              key={token}
              token={token}
              theme={theme}
              onWrite={write}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    </FieldGroup>
  );
}

/**
 * One theme colour.
 *
 * Which swatches it offers depends on the ROLE, not on the teacher: a page
 * colour is picked from paper tints and a heading colour from inks, because
 * neither of those constraints can be written into a schema where both are just
 * `HexColor`. `swatchesFor` is where that lives.
 */
function TokenField({
  token,
  theme,
  onWrite,
}: {
  token: ColorToken;
  theme: Theme;
  onWrite: (token: ColorToken, hex: HexColor) => void;
}) {
  const label =
    EVALUATION_COPY.colorName[token as keyof typeof EVALUATION_COPY.colorName];
  if (!label) return null;

  return (
    <ColorField
      label={label}
      value={theme.colors[token]}
      swatches={swatchesFor(token)}
      onChange={(hex) => onWrite(token, hex)}
    />
  );
}
