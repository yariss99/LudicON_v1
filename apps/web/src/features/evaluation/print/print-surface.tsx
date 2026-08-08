import { createPortal } from "react-dom";
import type { RefObject } from "react";
import type { EvaluationProject, ExerciseRegistry } from "@ludicon/evaluation";

import { BaremSheets } from "../barem/barem-sheet";
import { DocumentRenderer } from "../canvas/document-renderer";
import { paperFor, printsBarem, type PrintVariant } from "./print-variant";
import "./print.css";

/**
 * The paper the print window actually receives.
 *
 * A PORTAL TO `<body>`, and that placement is the whole design. `print.css`
 * hides the application with one structural rule —
 * `body > *:not([data-print-paper])` — which is only possible if this element
 * is a direct child of `<body>` rather than buried inside the builder's panel
 * tree. The rejected alternative, hiding the chrome by naming each panel, is a
 * list that goes stale the day someone adds one and whose staleness surfaces as
 * a rail printed down the side of an evaluation.
 *
 * It renders `DocumentRenderer` — the same component the editor draws, in the
 * same `mode="preview"` the teacher previews with — at `zoom: 1`. Zoom 1 means
 * `--mm` is one CSS millimetre, so the sheet is 210×297mm and the browser's
 * `@page { size: A4; margin: 0 }` lands on it exactly. Printing the editor's
 * own canvas instead would have inherited the teacher's magnification, the
 * scroller that clips it, and the selection overlay drawn over the top.
 *
 * It is mounted only while the print window is being set up, not for the life
 * of the builder. A second copy of the document costs a second render on every
 * edit, and there is no reason to pay it while someone is typing.
 *
 * ## It is also the thing that gets measured
 *
 * `validation/overflow.ts` reads its pages to find content that will be clipped
 * off the bottom of a sheet. That is why `print.css` hides this with
 * `visibility` and a zero height rather than `display: none`: a display-none
 * subtree has no boxes at all, every height reads zero, and the check that
 * matters most could never fire.
 */

export interface PrintSurfaceProps {
  document: EvaluationProject;
  registry: ExerciseRegistry;
  variant: PrintVariant;
  /** Handed to the overflow check, which measures the sheets rendered here. */
  surfaceRef: RefObject<HTMLDivElement | null>;
}

export function PrintSurface({
  document,
  registry,
  variant,
  surfaceRef,
}: PrintSurfaceProps) {
  const paper = paperFor(document, variant);

  return createPortal(
    /**
     * `aria-hidden`, because this is a duplicate of the paper the canvas is
     * already showing. Without it a screen reader would read the whole
     * evaluation twice, once from the editor and once from a copy the teacher
     * cannot see or reach.
     */
    <div data-print-paper aria-hidden ref={surfaceRef}>
      <DocumentRenderer
        document={paper}
        theme={paper.theme}
        mode="preview"
        zoom={1}
      />
      {printsBarem(variant) ? (
        <BaremSheets document={paper} registry={registry} />
      ) : null}
    </div>,
    globalThis.document.body,
  );
}
