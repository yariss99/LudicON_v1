import type { ValidationIssue } from "@ludicon/domain";
import { pxToMm } from "@ludicon/evaluation";

import { CHECK_COPY } from "./copy";

/**
 * The one check that needs a browser: does the paper still fit on the paper?
 *
 * `validateProject` cannot answer this and must not try. `@ludicon/evaluation`
 * is DOM-free by construction so the API and the PDF worker can parse a
 * document without a layout engine, and how tall a paragraph of Romanian text
 * renders at 11pt is exactly the question that needs one. The package's own
 * `layout/a4.ts` says so: "What genuinely needs measurement stays in the app,
 * which has a browser to ask."
 *
 * It matters more here than anywhere else in the product because of how a page
 * is drawn. A `Page` is a fixed 210×297mm box with `overflow: hidden`, so
 * content past the bottom margin does not push onto the next sheet — it is
 * CLIPPED, and it prints as nothing at all. A teacher who wrote a fourth
 * question at the bottom of page two would hand out a paper with three. That is
 * the failure mode this whole slice exists to close, so it is `blocking`.
 *
 * ## Measured against the print surface, never the editor canvas
 *
 * The editor draws at the teacher's zoom and in `mode="edit"`, which reserves a
 * band for every empty row and every piece the next slice fills in. Those bands
 * do not print, so measuring the canvas would report overflow on a paper that
 * fits. The hidden print surface is the same component at `zoom: 1` in
 * `mode="preview"` — the sheet that will actually go to the printer — so it is
 * the only honest thing to measure.
 *
 * The rejected alternative was estimating from the model: every exercise
 * definition carries `estimatedHeightMm`, and summing those needs no DOM. It is
 * the right tool for the PDF worker, which has no browser; it is the wrong tool
 * here, because an estimate that says "probably fits" and a sheet that clips
 * are two different documents and the teacher is holding the second one.
 */

export const OVERFLOW_ISSUE_CODE = "evaluation.print.page_overflow";

/**
 * One CSS pixel of slack.
 *
 * The content box's height is `calc(N * var(--mm))` and its children are laid
 * out in the same units, so a page that exactly fills its box lands within a
 * rounding step of zero. Reporting a paper as overflowing by a quarter of a
 * pixel would make the check the thing that stops people printing.
 */
const TOLERANCE_PX = 1;

export interface PageOverflow {
  /** 1-based, matching what the teacher sees in the pages rail. */
  readonly pageIndex: number;
  readonly overflowMm: number;
}

/**
 * The box a page's content is poured into, found by what it CONTAINS.
 *
 * `canvas/page-view.tsx` positions this box absolutely at the coordinates the
 * model computes, and the page's rows are its direct children — so the parent
 * of the first row IS the content box, by definition, whatever else the sheet
 * happens to hold.
 *
 * It was `page.firstElementChild`, which is the obvious reading and was wrong
 * within a day: the canvas grew a full-bleed background layer that is rendered
 * BEFORE the content box whenever a page has a colour or an image. That layer
 * is `inset: 0`, so its scroll height always equals its client height, and the
 * check would have reported "nothing overflows" on exactly the pages a teacher
 * had decorated — silently, and only on those pages. Identifying the box by its
 * position among siblings is a dependency on a file this slice does not own;
 * identifying it by the rows inside it is a dependency on what a page IS.
 *
 * A `data-content-box` attribute on that div would say it outright and is worth
 * asking for. This works without one.
 */
const contentBoxOf = (page: HTMLElement): HTMLElement | null => {
  const row = page.querySelector("[data-section-id]");
  const parent = row?.parentElement ?? null;
  return parent instanceof HTMLElement ? parent : null;
};

/**
 * How far each page overruns its content box.
 *
 * `scrollHeight - clientHeight` is the whole measurement: `clientHeight` is the
 * height the model asked for, `scrollHeight` is the height the content took.
 * The box does not scroll — the SHEET is what clips — but `scrollHeight` still
 * reports the extent of overflowing content on a `visible` box, which is
 * exactly the number wanted here.
 *
 * A page with no rows is skipped rather than measured. It has nothing that
 * could overflow, and the checklist already has something to say about a paper
 * with no content on it.
 */
export const measurePageOverflow = (
  root: HTMLElement | null,
): PageOverflow[] => {
  if (!root) return [];

  const readings: PageOverflow[] = [];
  const pages = root.querySelectorAll<HTMLElement>("[data-page-id]");

  for (const [index, page] of pages.entries()) {
    const box = contentBoxOf(page);
    if (!box) continue;

    const overflowPx = box.scrollHeight - box.clientHeight;
    if (overflowPx <= TOLERANCE_PX) continue;

    readings.push({
      pageIndex: index + 1,
      overflowMm: pxToMm(overflowPx),
    });
  }

  return readings;
};

/**
 * The readings, in the shape the rest of the product speaks.
 *
 * `ValidationIssue` from `@ludicon/domain`, not a local type, so the checklist
 * can concatenate these with `validateProject`'s output and render one list.
 * The teacher sees one set of problems with their paper; the fact that one of
 * them was found by measuring and the rest by parsing is an implementation
 * detail they must never be shown.
 *
 * The overflow is rounded UP to the millimetre. Rounding down would let "cam 0
 * mm rămân sub margine" onto the screen, which reads as the check being broken.
 */
export const overflowIssues = (
  readings: readonly PageOverflow[],
): ValidationIssue[] =>
  readings.map((reading) => ({
    code: OVERFLOW_ISSUE_CODE,
    severity: "blocking" as const,
    message: CHECK_COPY.overflowMessage(
      reading.pageIndex,
      Math.max(1, Math.ceil(reading.overflowMm)),
    ),
    path: `pages/${reading.pageIndex}`,
    remedy: CHECK_COPY.overflowRemedy,
  }));
