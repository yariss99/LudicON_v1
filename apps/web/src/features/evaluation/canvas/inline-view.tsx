import { Fragment } from "react";
import type { InlineNode, Mark } from "@ludicon/evaluation";

/**
 * Marked runs, rendered.
 *
 * Inline content is a FLAT array in the model — see that package's
 * `model/inline.ts` — so this is a map, not a recursion. A run carries its own
 * marks, which are applied by nesting the semantic elements the browser already
 * styles: `<strong>` and `<em>` rather than `font-weight` and `font-style`, so
 * the text still reads as emphasised to a screen reader and in a printed copy
 * where the visual difference may be lost.
 *
 * Maths is shown as its LaTeX source in a monospaced run. Rendering it properly
 * needs KaTeX, which is a decision about a dependency this slice has no
 * mandate to make; showing the source is honest and round-trips unedited, which
 * is what the model promises.
 */

const MARK_ELEMENT: Readonly<Record<Mark, keyof HTMLElementTagNameMap>> =
  Object.freeze({
    bold: "strong",
    italic: "em",
    underline: "u",
    strike: "s",
    sup: "sup",
    sub: "sub",
  });

function MarkedText({ text, marks }: { text: string; marks: readonly Mark[] }) {
  return marks.reduce<React.ReactNode>((inner, mark) => {
    const Element = MARK_ELEMENT[mark];
    return <Element>{inner}</Element>;
  }, text);
}

export interface InlineViewProps {
  nodes: readonly InlineNode[];
}

export function InlineView({ nodes }: InlineViewProps) {
  return (
    <>
      {nodes.map((node, index) => (
        <Fragment key={index}>
          {node.kind === "text" ? (
            <MarkedText text={node.text} marks={node.marks} />
          ) : node.kind === "break" ? (
            <br />
          ) : (
            <span style={{ fontFamily: "ui-monospace, monospace" }}>
              {node.latex}
            </span>
          )}
        </Fragment>
      ))}
    </>
  );
}
