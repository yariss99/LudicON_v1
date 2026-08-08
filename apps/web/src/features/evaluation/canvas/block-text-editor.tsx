import { useState } from "react";
import {
  inlineToPlainText,
  plainTextToInline,
  type Block,
} from "@ludicon/evaluation";
import { Input, Textarea } from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import type { MeasuredRect } from "./use-measured-node";

/**
 * The house inline-edit pattern, laid over the page.
 *
 * A `<button>` that swaps to an `<Input>` — the shape already used by
 * `design-studio/pedagogical-block-card.tsx` — rather than `contentEditable`.
 * `contentEditable` is the obvious way to edit text where it sits, and it is
 * the single highest-risk thing this feature could contain: it puts the browser
 * in charge of the DOM inside a renderer whose whole contract is being a pure
 * function of the model, it pastes arbitrary HTML that then has to be sanitised
 * back into the flat inline array, and its selection behaviour differs across
 * engines in ways that only show up on someone else's machine. It buys nothing
 * this slice needs: there is no per-character formatting yet.
 *
 * The field is positioned over the block's measured rectangle so the text stays
 * where the teacher was looking, and it is opaque, so the block underneath —
 * which the renderer still draws, because the renderer does not know an editor
 * exists — is covered rather than showing through.
 *
 * The edit commits ONCE, on leaving the field, not on every keystroke. Each
 * commit is a history entry, and a teacher who typed a sentence and pressed ⌘Z
 * should get the sentence back, not the last letter of it.
 *
 * ## Closing with a key hands focus back; closing with a click does not
 *
 * Enter and Escape unmount the field, and an unmounted element cannot hold
 * focus, so without `onReturnFocus` the browser gives it to `<body>` and the
 * teacher's next Tab restarts at the top of the screen. It is wired only to the
 * two KEY paths. The blur path looks like it wants the same treatment and must
 * not have it: blur also fires when the teacher clicks the inspector, and
 * pulling focus back to the paper would fight the click that caused it. Testing
 * `document.activeElement` inside a blur handler was the tempting shortcut and
 * it is unreliable — the browser is entitled to report `<body>` mid-transition,
 * which is exactly the case that has to be told apart.
 */

export type EditableBlock = Extract<
  Block,
  { kind: "heading" | "paragraph" | "list" }
>;

export const isEditableBlock = (block: Block): block is EditableBlock =>
  block.kind === "heading" ||
  block.kind === "paragraph" ||
  block.kind === "list";

const readText = (block: EditableBlock): string =>
  block.kind === "list"
    ? block.items.map((item) => inlineToPlainText(item)).join("\n")
    : inlineToPlainText(block.content);

const writeText = (block: EditableBlock, value: string): EditableBlock =>
  block.kind === "list"
    ? {
        ...block,
        items: value.split("\n").map((line) => plainTextToInline(line)),
      }
    : { ...block, content: plainTextToInline(value) };

export interface BlockTextEditorProps {
  block: EditableBlock;
  rect: MeasuredRect;
  onCommit: (next: EditableBlock) => void;
  onClose: () => void;
  /** Called only when a KEY closed the field. See the note above. */
  onReturnFocus: () => void;
}

export function BlockTextEditor({
  block,
  rect,
  onCommit,
  onClose,
  onReturnFocus,
}: BlockTextEditorProps) {
  const [value, setValue] = useState(() => readText(block));

  const commit = () => {
    if (value !== readText(block)) onCommit(writeText(block, value));
    onClose();
  };

  const commitByKey = () => {
    commit();
    onReturnFocus();
  };

  const shared = {
    autoFocus: true,
    value,
    "aria-label": EVALUATION_COPY.fieldText,
    onBlur: commit,
    onChange: (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => setValue(event.target.value),
  };

  return (
    <div
      className="pointer-events-auto absolute"
      style={{
        left: rect.left,
        top: rect.top,
        width: Math.max(rect.width, 120),
      }}
    >
      {block.kind === "heading" ? (
        <Input
          {...shared}
          className="min-h-11 bg-surface"
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === "Escape") {
              event.preventDefault();
              commitByKey();
            }
          }}
        />
      ) : (
        <Textarea
          {...shared}
          rows={block.kind === "list" ? block.items.length + 1 : 3}
          className="min-h-11 bg-surface"
          placeholder={
            block.kind === "list" ? EVALUATION_COPY.fieldItemsHint : undefined
          }
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              commitByKey();
            }
          }}
        />
      )}
    </div>
  );
}
