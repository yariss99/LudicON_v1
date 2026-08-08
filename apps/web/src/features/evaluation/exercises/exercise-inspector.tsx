import {
  inlineToPlainText,
  plainTextToInline,
  resolveExerciseLayout,
  type ExerciseBlock,
} from "@ludicon/evaluation";

import { EVALUATION_COPY } from "../copy";
import { useEditor, useEditorStore } from "../editor-context";
import { CountField, LongTextField, PickOne } from "./fields";
import {
  writeExercise,
  writeLayout,
  writePoints,
  writePrompt,
} from "./exercise-actions";
import { EXERCISE_FIELDS, EXERCISE_REGISTRY } from "./registry";

/**
 * Everything about one exercise the teacher can set, in the order they set it.
 *
 * The cerință first, because it is what they came to write; then what the
 * question is worth; then the question's own parts and its barem, which is the
 * type's business and is drawn by the type's own component. Layout is last: it
 * is the only control here that changes nothing about what is being asked.
 *
 * ## The barem is edited beside the question, not on a separate screen
 *
 * The two are stored apart — `document.answerKey` is keyed by block id so an
 * exercise can move between pages without dragging its answer around, and so
 * the pupil's printout can be produced by dropping one record. But a teacher
 * writing "care este capitala României?" knows the answer at that exact moment,
 * and a separate barem screen would mean typing every question twice from
 * memory later. Storage and editing are different questions and this file
 * answers the second one.
 *
 * ## The prompt is plain text here, rich text on the page
 *
 * `block.prompt` is inline content and can carry bold, italic and maths. This
 * field projects it to plain text and back, which loses those marks if the
 * teacher edits a cerință that had them. That is the trade for having ONE
 * control that works with a keyboard, in a 344px rail, today — the canvas's own
 * text editing is where marks belong, and when it learns to edit a prompt this
 * field goes away.
 */

export interface ExerciseInspectorProps {
  block: ExerciseBlock;
}

export function ExerciseInspector({ block }: ExerciseInspectorProps) {
  const store = useEditorStore();
  const answer = useEditor((state) => state.document.answerKey[block.id]);

  const definition = EXERCISE_REGISTRY.get(block.exerciseType);
  const Fields = EXERCISE_FIELDS.get(block.exerciseType);

  if (!definition || !Fields) {
    return (
      <p className="px-4 py-4 text-base text-muted-foreground">
        {EVALUATION_COPY.exerciseGone}
      </p>
    );
  }

  const layout = resolveExerciseLayout(definition, block.layoutId);
  const field = (name: string) => `${block.id}-${name}`;

  return (
    <div className="flex flex-col gap-5 px-4 py-4">
      <LongTextField
        id={field("prompt")}
        label={EVALUATION_COPY.fieldExercisePrompt}
        hint={EVALUATION_COPY.fieldExercisePromptHint}
        rows={3}
        value={inlineToPlainText(block.prompt)}
        onChange={(text) => writePrompt(store, block, plainTextToInline(text))}
      />

      <CountField
        id={field("points")}
        label={EVALUATION_COPY.fieldExercisePoints}
        value={block.points}
        least={0}
        most={100}
        onChange={(points) => writePoints(store, block, points)}
      />

      <Fields
        config={block.config}
        answer={answer?.answer}
        idPrefix={block.id}
        onChange={(draft) => writeExercise(store, block, draft)}
      />

      {definition.layouts.length > 1 ? (
        <PickOne
          name={field("layout")}
          label={EVALUATION_COPY.fieldExerciseLayout}
          options={definition.layouts.map((one) => ({
            value: one.id,
            label: one.label,
          }))}
          value={layout?.id ?? null}
          onChange={(id) => writeLayout(store, block, id)}
        />
      ) : null}
    </div>
  );
}
