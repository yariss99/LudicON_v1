import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  type LucideIcon,
} from "lucide-react";
import {
  DividerStyle,
  HeadingLevel,
  ListStyle,
  resolveBlockStyle,
  TextAlign,
  type Block,
} from "@ludicon/evaluation";
import {
  Label,
  RadioGroup,
  RadioGroupItem,
  ToggleGroup,
  ToggleGroupItem,
} from "@ludicon/ui";

import { EVALUATION_COPY } from "../copy";
import { ExerciseInspector } from "../exercises";
import { replaceBlock } from "../document-actions";
import { useEditor, useEditorStore } from "../editor-context";
import { Field, NumberField, TextField } from "./inspector-field";

/**
 * The settings of one piece.
 *
 * Every control writes the WHOLE block back through `updateBlock`, because the
 * model has no partial patch and deliberately so: a partial patch over a
 * discriminated union is either unsound or a command family per kind. One
 * replacement is exactly invertible, which is what makes each of these controls
 * a single, undoable step.
 *
 * ## One change is one press of ⌘Z, and that is a rule about typing too
 *
 * Every field here used to write on `change`. For a toggle that is exactly
 * right — a press is a change. For the two text boxes it was a command per
 * KEYSTROKE: a forty-character image address cost about forty history entries,
 * so undoing "I pasted the wrong link" was forty presses of ⌘Z, each of which
 * took back one letter. The spacer's slider had the same fault by the same
 * arithmetic — one drag from 8mm to 40mm is thirty-two entries.
 *
 * So neither shape is written here any more. `TextField` and `NumberField` in
 * `./inspector-field.tsx` already commit at the grain a teacher experiences —
 * blur or Enter for text, pointer release or one arrow press for a number — and
 * that file argues the case at length, including why coalescing inside the
 * history was the wrong place to fix it. Using them also retires this file's
 * private `Field`, which was the second copy of a layout primitive and the
 * reason a label could end up 14px in one drawer and 16px in the next.
 *
 * Alignment is written to `block.style`, the teacher's override layer, not to
 * the theme. A block with no override follows the theme, so re-theming a paper
 * actually re-themes it; a block the teacher centred stays centred. That
 * distinction is the reason `BlockStyleOverride` exists as a separate schema.
 *
 * The five kinds this slice does not draw get no controls rather than disabled
 * ones. A disabled field is a promise about a shape the next slice has not
 * settled yet.
 *
 * The panel's heading is not here. `inspector-panel.tsx` frames every kind of
 * selection identically, so this file is fields and nothing else — see the note
 * there about the three ranks that were painted as one.
 */

const ALIGN_ORDER = TextAlign.options;
const LEVEL_ORDER = HeadingLevel.options;
const LIST_ORDER = ListStyle.options;
const DIVIDER_ORDER = DividerStyle.options;

/**
 * Alignment is drawn, not spelled.
 *
 * "Aliniat pe ambele margini" is 24 characters; the four names together are
 * wider than the rail twice over, so as a row of words the control wrapped onto
 * three lines and still could not be read at a glance. These four glyphs are
 * the one place in this product where the picture is unambiguous — every word
 * processor a teacher has used draws them the same way — and the Romanian
 * names remain as each item's accessible name, which is what a screen reader
 * announces and what a hover reveals.
 */
const ALIGN_ICON: Readonly<Record<TextAlign, LucideIcon>> = Object.freeze({
  left: AlignLeft,
  center: AlignCenter,
  right: AlignRight,
  justify: AlignJustify,
});

export interface BlockInspectorProps {
  block: Block;
}

export function BlockInspector({ block }: BlockInspectorProps) {
  const store = useEditorStore();
  const theme = useEditor((state) => state.document.theme);
  const write = (next: Block) => replaceBlock(store, next);
  const field = (name: string) => `${block.id}-${name}`;

  /**
   * The alignment shown is the one in force, not the one overridden.
   *
   * `block.style?.align` is undefined until the teacher sets it, so the control
   * came up with nothing selected on every piece they had not already aligned —
   * a segmented control claiming the paragraph has no alignment, while the
   * paragraph on screen was plainly left-aligned. `resolveBlockStyle` is the
   * same function the renderer asks, so what the panel says and what the page
   * shows are one answer.
   *
   * Reading the resolved value writes nothing: a block with no override still
   * follows the theme, and re-theming still re-themes it. Only a press writes,
   * and a press is the teacher saying "this one, from now on".
   */
  const align = resolveBlockStyle(theme, block).align;
  const setAlign = (value: string) => {
    const parsed = TextAlign.safeParse(value);
    if (!parsed.success) return;
    write({ ...block, style: { ...block.style, align: parsed.data } });
  };

  /**
   * An exercise is configured by its own type, not by this panel.
   *
   * Every control below edits a property this file knows the name of — a
   * heading's level, a list's marker. An exercise's settings are declared by its
   * registry entry and differ per type, so the only honest thing this panel can
   * do is hand over. `ExerciseInspector` reads the definition and renders the
   * editor that shipped with it, which is what keeps "adding a type touches no
   * existing file" true of this file too.
   *
   * It returns early rather than rendering alongside, because the shared
   * controls underneath — alignment, spacing — belong to the block, and an
   * exercise's layout is chosen from the layouts its own type declares.
   */
  if (block.kind === "exercise") return <ExerciseInspector block={block} />;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      {block.kind === "heading" ? (
        <Field label={EVALUATION_COPY.fieldHeadingLevel}>
          {/* Four sizes in words, over two lines. `wrap` is the component's
              own, not a caller's `flex-wrap`: the class alone left the track
              at `--radius-full`, which on a two-line box is an ellipse with
              its corner options hanging outside it. */}
          <ToggleGroup
            type="single"
            wrap
            value={block.level}
            onValueChange={(value) => {
              const parsed = HeadingLevel.safeParse(value);
              if (parsed.success) write({ ...block, level: parsed.data });
            }}
          >
            {LEVEL_ORDER.map((level) => (
              <ToggleGroupItem key={level} value={level}>
                {EVALUATION_COPY.headingLevel[level]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Field>
      ) : null}

      {block.kind === "heading" ||
      block.kind === "paragraph" ||
      block.kind === "list" ? (
        <Field label={EVALUATION_COPY.fieldAlign}>
          <ToggleGroup type="single" value={align} onValueChange={setAlign}>
            {ALIGN_ORDER.map((value) => {
              const Icon = ALIGN_ICON[value];
              return (
                <ToggleGroupItem
                  key={value}
                  value={value}
                  aria-label={EVALUATION_COPY.align[value]}
                  className="px-0"
                >
                  <Icon aria-hidden strokeWidth={1.75} />
                </ToggleGroupItem>
              );
            })}
          </ToggleGroup>
        </Field>
      ) : null}

      {block.kind === "list" ? (
        <Field label={EVALUATION_COPY.fieldListStyle}>
          <RadioGroup
            value={block.listStyle}
            onValueChange={(value) => {
              const parsed = ListStyle.safeParse(value);
              if (parsed.success) write({ ...block, listStyle: parsed.data });
            }}
          >
            {LIST_ORDER.map((value) => (
              <div key={value} className="flex min-h-11 items-center gap-2">
                <RadioGroupItem id={field(value)} value={value} />
                <Label htmlFor={field(value)}>
                  {EVALUATION_COPY.listStyle[value]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>
      ) : null}

      {block.kind === "image" ? (
        <>
          {/* Trimmed on the way in: an address pasted out of a browser bar
              arrives with a trailing space often enough, and a `src` that
              differs from the same `src` by one invisible character is a
              document that will not compare equal to itself. */}
          <TextField
            label={EVALUATION_COPY.fieldImageSrc}
            value={block.src}
            maxLength={4000}
            onCommit={(src) => write({ ...block, src: src.trim() })}
          />
          <TextField
            label={EVALUATION_COPY.fieldImageAlt}
            value={block.alt}
            hint={EVALUATION_COPY.fieldImageAltHint}
            maxLength={300}
            onCommit={(alt) => write({ ...block, alt })}
          />
        </>
      ) : null}

      {block.kind === "divider" ? (
        <Field label={EVALUATION_COPY.fieldDividerStyle}>
          <RadioGroup
            value={block.dividerStyle}
            onValueChange={(value) => {
              const parsed = DividerStyle.safeParse(value);
              if (parsed.success)
                write({ ...block, dividerStyle: parsed.data });
            }}
          >
            {DIVIDER_ORDER.map((value) => (
              <div key={value} className="flex min-h-11 items-center gap-2">
                <RadioGroupItem id={field(value)} value={value} />
                <Label htmlFor={field(value)}>
                  {EVALUATION_COPY.dividerStyle[value]}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </Field>
      ) : null}

      {block.kind === "spacer" ? (
        <NumberField
          label={EVALUATION_COPY.fieldSpacerHeight}
          value={block.heightMm}
          min={2}
          max={80}
          step={1}
          unit="mm"
          onCommit={(heightMm) => write({ ...block, heightMm })}
        />
      ) : null}
    </div>
  );
}
