import type { CSSProperties } from "react";
import {
  contentBox,
  effectivePageSetup,
  gradientCss,
  PAGE_IMAGE_FIT_CSS,
  PAGE_IMAGE_POSITION_CSS,
  pageSize,
  resolveColor,
  sectionsOfPage,
  type EvaluationProject,
  type Page,
  type PageBackground,
  type Theme,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";
import type { RenderMode } from "./block-view";
import { mm } from "./mm";
import { SectionView } from "./section-view";

/**
 * One sheet of A4, at its real proportions.
 *
 * The box is `210 × 297` multiplied by `--mm`, so it measures exactly what it
 * claims: `getBoundingClientRect().width / millimetreInPx(zoom)` is 210 to
 * within a rounding step, at any zoom. Nothing here uses a viewport unit or a
 * percentage of the surrounding panel — a page whose size depended on the
 * window would be a page whose margins meant something different on a laptop
 * than on a monitor, and the margin is the one measurement a printed evaluation
 * has to keep.
 *
 * The content box is positioned ABSOLUTELY inside the sheet, at the coordinates
 * the model computes. The rejected alternative was CSS padding on the page:
 * padding cannot express a header that reserves space only on pages after the
 * first, which is the default setup for a Romanian evaluation paper, so the
 * cover's content would start a header's height too low.
 *
 * ## The background is a LAYER, not the sheet's own fill
 *
 * `page.background.opacity` is the reason. Setting `opacity` on the page itself
 * fades the text with it, which is the opposite of what the setting is for: the
 * case it exists for is a school crest behind a paper the pupil still has to
 * read. So the sheet keeps the theme's paper colour at full strength, and the
 * teacher's colour and image are painted into a box over it that carries the
 * opacity alone. The content box comes after it in the DOM and is therefore in
 * front, with no `z-index` needed and none wanted — a stacking context here
 * would trap the free-placement blocks a cover page is allowed to hold.
 *
 * What is painted into that layer is worked out by `paintBackground` below, and
 * every part of the answer that is arithmetic rather than markup lives in
 * `packages/evaluation/src/model/page.ts`: `gradientCss` formats the stops,
 * `PAGE_IMAGE_FIT_CSS` and `PAGE_IMAGE_POSITION_CSS` translate the two enums.
 * This file used to hard-code `cover` and `center` and say so, because the
 * model had nowhere to store anything else; the reason the constants are in the
 * package rather than here is the same reason that note gave for not inventing
 * them — the canvas and the PDF worker must not each guess, and guess
 * differently.
 *
 * The teacher's own colours are written as inline literals. That is the
 * exception `block-view.tsx` takes and the same one applies here: this is
 * document data arriving from the model, not a design-system decision, and a
 * semantic token would paint the sheet a colour the teacher did not choose.
 */

export interface PageViewProps {
  page: Page;
  document: EvaluationProject;
  theme: Theme;
  mode: RenderMode;
  /** 1-based, for the page's accessible name. */
  index: number;
  total: number;
}

export function PageView({
  page,
  document,
  theme,
  mode,
  index,
  total,
}: PageViewProps) {
  const setup = effectivePageSetup(document.pageSetup, page);
  const size = pageSize(setup);
  const box = contentBox(setup, index === 1);
  const sections = sectionsOfPage(document, page);

  const layer = page.background
    ? paintBackground(theme, page.background)
    : null;

  return (
    <div
      data-page-id={page.id}
      data-page-index={index}
      aria-label={EVALUATION_COPY.pageOf(index, total)}
      style={{
        position: "relative",
        width: mm(size.width),
        height: mm(size.height),
        backgroundColor: resolveColor(theme, "background"),
        color: resolveColor(theme, "text"),
        fontFamily: theme.typography.fontFamily,
        overflow: "hidden",
      }}
    >
      {layer ? (
        <div aria-hidden style={{ position: "absolute", inset: 0, ...layer }} />
      ) : null}

      <div
        style={{
          position: "absolute",
          left: mm(box.x),
          top: mm(box.y),
          width: mm(box.width),
          height: mm(box.height),
        }}
      >
        {sections.length === 0 && mode === "edit" ? (
          <p
            style={{
              color: resolveColor(theme, "textMuted"),
              fontSize: mm(4),
              opacity: 0.7,
            }}
          >
            {EVALUATION_COPY.emptyPageExplanation}
          </p>
        ) : (
          sections.map((section) => (
            <SectionView
              key={section.id}
              section={section}
              document={document}
              theme={theme}
              mode={mode}
              contentWidthMm={box.width}
            />
          ))
        )}
      </div>
    </div>
  );
}

/**
 * The layer's paint, or `null` when the sheet has asked for nothing.
 *
 * `null` and an object of `undefined`s are not the same thing here: a page that
 * inherits draws no layer at all, which is what keeps a re-theme visible
 * through it. A sheet carrying a background record with nothing filled in yet —
 * the state the panel passes through while a teacher is choosing — is the same
 * case and returns `null` too.
 *
 * The three kinds are mutually exclusive in the panel, so the order below is a
 * tie-break that should never be needed rather than a layering rule. It reads
 * image, gradient, colour because that is most specific to least: whichever the
 * teacher last committed is the only one present.
 *
 * The image URL goes through `encodeURI`, not because a teacher is an attacker
 * but because `url("…")` is a quoted string and an address containing a quote
 * would end it early — turning the rest of the address into CSS and, at worst,
 * into a second declaration.
 */
const paintBackground = (
  theme: Theme,
  background: PageBackground,
): CSSProperties | null => {
  const opacity = background.opacity;

  if (background.imageSrc) {
    const fit = PAGE_IMAGE_FIT_CSS[background.imageFit];
    return {
      opacity,
      backgroundImage: `url("${encodeURI(background.imageSrc)}")`,
      backgroundSize: fit.size,
      backgroundRepeat: fit.repeat,
      backgroundPosition: PAGE_IMAGE_POSITION_CSS[background.imagePosition],
    };
  }

  if (background.gradient) {
    return {
      opacity,
      backgroundImage: gradientCss(background.gradient, (color) =>
        resolveColor(theme, color),
      ),
    };
  }

  if (background.color) {
    return { opacity, backgroundColor: resolveColor(theme, background.color) };
  }

  return null;
};
