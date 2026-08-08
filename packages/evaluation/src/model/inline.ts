import { z } from "zod";

/**
 * Inline content is a FLAT array of nodes, never a nested rich-text tree.
 *
 * The rejected alternative was a ProseMirror-shaped tree (`{ type, content: []
 * }` all the way down). A tree buys nesting we do not need — an evaluation paper
 * has no bold-inside-a-link-inside-a-footnote — and costs a recursive Zod schema
 * (`z.lazy`), a recursive diff for undo, and a renderer that has to walk it. A
 * flat array of marked runs expresses everything the printed page can show, and
 * a mark change is a one-element diff.
 *
 * The three node kinds are the three things that genuinely cannot be a marked
 * run: text (which carries the marks), an explicit line break inside one
 * paragraph, and a maths expression, whose LaTeX source is opaque to text
 * processing and must survive round-trips unedited.
 */

export const Mark = z.enum([
  "bold",
  "italic",
  "underline",
  "strike",
  "sup",
  "sub",
]);
export type Mark = z.infer<typeof Mark>;

export const InlineText = z.object({
  kind: z.literal("text"),
  text: z.string().max(20000),
  marks: z.array(Mark).default([]),
});
export type InlineText = z.infer<typeof InlineText>;

/** A hard break inside one paragraph. Not a paragraph boundary — that is a block. */
export const InlineBreak = z.object({
  kind: z.literal("break"),
});
export type InlineBreak = z.infer<typeof InlineBreak>;

/**
 * A maths expression, stored as its LaTeX source.
 *
 * Rendering it is the app's job (KaTeX or an SVG pass in the print pipeline).
 * Storing a rendered form here would bind the document to one renderer version
 * and make the same file print differently after an upgrade.
 */
export const InlineMath = z.object({
  kind: z.literal("math"),
  latex: z.string().min(1).max(2000),
});
export type InlineMath = z.infer<typeof InlineMath>;

export const InlineNode = z.discriminatedUnion("kind", [
  InlineText,
  InlineBreak,
  InlineMath,
]);
export type InlineNode = z.infer<typeof InlineNode>;

export const InlineContent = z.array(InlineNode);
export type InlineContent = z.infer<typeof InlineContent>;

/** Builds a text run. Marks are copied, so the caller's array stays theirs. */
export const inlineText = (
  value: string,
  marks: readonly Mark[] = [],
): InlineText => ({ kind: "text", text: value, marks: [...marks] });

export const inlineBreak = (): InlineBreak => ({ kind: "break" });

export const inlineMath = (latex: string): InlineMath => ({
  kind: "math",
  latex,
});

/**
 * The plain-text projection, used for search, validation ("is this empty?") and
 * the answer key's exported text.
 *
 * Maths contributes its LaTeX source rather than a rendered approximation:
 * `\frac{1}{2}` searched for as "frac" is a surprise a teacher will never hit,
 * whereas silently dropping the node would make a maths-only prompt look empty
 * to the validator and get flagged as a missing question.
 */
export const inlineToPlainText = (nodes: readonly InlineNode[]): string =>
  nodes
    .map((node) => {
      switch (node.kind) {
        case "text":
          return node.text;
        case "break":
          return "\n";
        case "math":
          return node.latex;
      }
    })
    .join("");

/**
 * The inverse projection. Newlines become explicit break nodes so that
 * `inlineToPlainText(plainTextToInline(s)) === s` for every string.
 *
 * An empty string yields an empty array rather than one empty text run, so
 * seeding a block from blank metadata does not leave a phantom node behind that
 * every emptiness check then has to look through.
 */
export const plainTextToInline = (value: string): InlineNode[] => {
  if (value === "") return [];
  return value
    .split("\n")
    .flatMap((line, index) =>
      index === 0 ? [inlineText(line)] : [inlineBreak(), inlineText(line)],
    );
};

export const isEmptyInline = (nodes: readonly InlineNode[]): boolean =>
  inlineToPlainText(nodes).trim() === "";

/** Applies a mark to every text run, leaving breaks and maths untouched. */
export const withMark = (
  nodes: readonly InlineNode[],
  mark: Mark,
): InlineNode[] =>
  nodes.map((node) =>
    node.kind === "text" && !node.marks.includes(mark)
      ? { ...node, marks: [...node.marks, mark] }
      : node,
  );

export const withoutMark = (
  nodes: readonly InlineNode[],
  mark: Mark,
): InlineNode[] =>
  nodes.map((node) =>
    node.kind === "text"
      ? { ...node, marks: node.marks.filter((existing) => existing !== mark) }
      : node,
  );
