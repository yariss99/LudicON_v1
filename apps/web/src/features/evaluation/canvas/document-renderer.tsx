import type { ReactNode } from "react";
import {
  pagesInOrder,
  type EvaluationProject,
  type Theme,
} from "@ludicon/evaluation";

import type { RenderMode } from "./block-view";
import { mm, scaleVariable } from "./mm";
import { PageView } from "./page-view";

/**
 * The paper, as a pure function of the document.
 *
 * This is load-bearing and it is the reason the editor is built the way it is:
 * the same component has to produce the sheet on screen, the sheet that goes to
 * the printer, and the sheet the PDF worker rasterises. The moment a selection
 * outline, a hover state or a drag handle is drawn from inside a block, those
 * three stop being the same thing and the preview stops being a preview.
 *
 * So: no props beyond the document, its theme and which of the two renderings
 * is wanted; no reads of the editor store anywhere beneath this component; no
 * event handlers. Everything the teacher can touch is layered over the top by
 * `editor-overlay.tsx`, which finds what it needs by measuring the
 * `data-block-id` / `data-section-id` / `data-page-id` attributes the model
 * already justifies emitting.
 *
 * `--mm` is declared here, once, on the stack of pages, so a zoom change is a
 * single custom-property write and the sheets stay in step with each other.
 */

export interface DocumentRendererProps {
  document: EvaluationProject;
  theme: Theme;
  mode: RenderMode;
  /** Page scale. 1 means one CSS millimetre per document millimetre. */
  zoom?: number;
}

export function DocumentRenderer({
  document,
  theme,
  mode,
  zoom = 1,
}: DocumentRendererProps) {
  const pages = pagesInOrder(document);

  return (
    <div
      data-document-id={document.id}
      style={{
        ...scaleVariable(zoom),
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: mm(10),
      }}
    >
      {pages.map((page, index) => (
        <PageFrame key={page.id}>
          <PageView
            page={page}
            document={document}
            theme={theme}
            mode={mode}
            index={index + 1}
            total={pages.length}
          />
        </PageFrame>
      ))}
    </div>
  );
}

/**
 * The drop shadow that makes a sheet read as paper.
 *
 * On a wrapper rather than on the page itself, because a shadow is a fact about
 * the screen and not about the document — the printed sheet has none, and the
 * PDF renderer must not inherit one from the component it shares with the
 * editor. It uses the design system's `shadow-soft`, which is chrome, not the
 * teacher's colours.
 */
function PageFrame({ children }: { children: ReactNode }) {
  return <div className="shadow-soft">{children}</div>;
}
